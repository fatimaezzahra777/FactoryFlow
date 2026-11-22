const AppError = require('../utils/AppError');
const { ROLES, ORDER_STATUS } = require('../utils/constants');
const { runInTransaction } = require('../utils/transaction');
const { computeRequirements, idOf } = require('../utils/requirements');
const orderRepository = require('../repositories/orderRepository');
const produitRepository = require('../repositories/produitRepository');
const composantRepository = require('../repositories/composantRepository');
const matiereRepository = require('../repositories/matierePremiereRepository');
const stockRepository = require('../repositories/stockRepository');
const userRepository = require('../repositories/userRepository');

const ADMIN_VIEW = { role: ROLES.ADMIN };

const canAccess = (order, user) =>
  user.role === ROLES.ADMIN || idOf(order.operator) === String(user.id);

// L'opérateur ne voit et n'exécute que SES ordres (404 pour ne rien révéler des autres)
const assertOwned = (order, user) => {
  if (!order || !user.id || idOf(order.operator) !== String(user.id)) {
    throw new AppError('Ordre introuvable', 404);
  }
};

const ensureOperator = async (operatorId) => {
  if (!operatorId) return;
  const user = await userRepository.findById(operatorId);
  if (!user || user.role !== ROLES.OPERATEUR) throw new AppError('Opérateur introuvable', 422);
};

// Copie la composition actuelle de chaque produit dans les lignes de l'ordre
const buildLines = async (lines) => {
  const produits = await Promise.all(lines.map((l) => produitRepository.findById(l.produit)));
  if (produits.some((p) => !p)) throw new AppError('Un ou plusieurs produits sont introuvables', 422);

  const composants = await composantRepository.findByProduits(lines.map((l) => l.produit));
  return lines.map((line, i) => {
    const produit = produits[i];
    const composition = composants
      .filter((c) => String(c.produit) === String(produit._id) && c.matiere)
      .map((c) => ({ matiere: c.matiere._id, quantite: c.quantite }));
    if (composition.length === 0) {
      throw new AppError(`Le produit ${produit.name} n'a pas de composition`, 422);
    }
    return {
      produit: produit._id,
      reference: produit.reference,
      name: produit.name,
      quantite: line.quantite,
      composition,
    };
  });
};

const failTransition = async (id, message) => {
  const exists = await orderRepository.findById(id);
  throw exists ? new AppError(message, 409) : new AppError('Ordre introuvable', 404);
};

const getById = async (id, user) => {
  const order = await orderRepository.findDetailed(id);
  if (!order || !canAccess(order, user)) throw new AppError('Ordre introuvable', 404);
  return { ...order.toJSON(), besoins: computeRequirements(order.lines) };
};

const create = async ({ lines, operator = null }, userId) => {
  await ensureOperator(operator);
  const built = await buildLines(lines);
  const order = await runInTransaction(async (session) => {
    const number = await orderRepository.nextNumber(session);
    return orderRepository.create({ number, lines: built, operator, createdBy: userId }, session);
  });
  return getById(order._id, ADMIN_VIEW);
};

const list = ({ status, produit, operator, from, to, page, limit }, user) => {
  const filter = {};
  if (status) filter.status = status;
  if (produit) filter['lines.produit'] = produit;
  if (user.role === ROLES.OPERATEUR) filter.operator = user.id;
  else if (operator) filter.operator = operator;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  return orderRepository.findPage(filter, { page, limit });
};

const stats = async () => {
  const rows = await orderRepository.countByStatus();
  const byStatus = Object.fromEntries(Object.values(ORDER_STATUS).map((s) => [s, 0]));
  rows.forEach((r) => { byStatus[r._id] = r.count; });
  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  return { total, byStatus };
};

// Modification et affectation : uniquement tant que l'ordre est planifié
const update = async (id, { lines, operator }) => {
  const data = {};
  if (operator !== undefined) {
    await ensureOperator(operator);
    data.operator = operator;
  }
  if (lines) data.lines = await buildLines(lines);

  const updated = await orderRepository.updateIfStatus(id, ORDER_STATUS.PLANNED, data);
  if (!updated) await failTransition(id, 'Seul un ordre planifié peut être modifié');
  return getById(id, ADMIN_VIEW);
};

const cancel = async (id) => {
  const updated = await orderRepository.updateIfStatus(id, ORDER_STATUS.PLANNED, {
    status: ORDER_STATUS.CANCELLED,
    cancelledAt: new Date(),
  });
  if (!updated) await failTransition(id, 'Seul un ordre planifié peut être annulé');
  return getById(id, ADMIN_VIEW);
};

// Démarrage atomique : vérification des stocks, changement de statut et sorties de stock
// dans UNE transaction. Une erreur à n'importe quelle étape annule tout.
const start = async (id, user) => {
  await runInTransaction(async (session) => {
    const order = await orderRepository.findById(id, session);
    assertOwned(order, user);
    if (order.status !== ORDER_STATUS.PLANNED) {
      throw new AppError('Seul un ordre planifié peut être démarré', 409);
    }

    // Besoins : calculés par produit, puis additionnés par matière
    const needs = computeRequirements(order.lines);

    const shortages = [];
    for (const need of needs) {
      const matiereId = idOf(need.matiere);
      const stock = await stockRepository.findByMatiere(matiereId, session);
      const available = stock?.quantite ?? 0;
      if (available < need.quantite) {
        shortages.push({ matiere: matiereId, requis: need.quantite, disponible: available });
      }
    }
    if (shortages.length > 0) {
      const materials = await matiereRepository.findByIds(shortages.map((s) => s.matiere));
      const byId = new Map(materials.map((m) => [String(m._id), m]));
      const details = shortages.map((s) => {
        const m = byId.get(s.matiere);
        return { ...s, reference: m?.reference, name: m?.name, unite: m?.unite };
      });
      const text = details
        .map((d) => `${d.name ?? d.matiere} (${d.disponible} ${d.unite ?? ''} disponible, ${d.requis} requis)`)
        .join(' ; ');
      throw new AppError(`Stock insuffisant : ${text}. Aucun stock n'a été déduit.`, 409, details);
    }

    // Un second démarrage échoue ici : le statut n'est plus PLANNED
    const claimed = await orderRepository.updateIfStatus(
      id,
      ORDER_STATUS.PLANNED,
      { status: ORDER_STATUS.IN_PROGRESS, startedAt: new Date() },
      session
    );
    if (!claimed) throw new AppError('Cet ordre a déjà été démarré', 409);

    for (const need of needs) {
      const consumed = await stockRepository.consume(idOf(need.matiere), need.quantite, id, user.id, session);
      if (!consumed) throw new AppError("Stock insuffisant : l'opération a été annulée", 409);
    }
  });
  return getById(id, user);
};

const complete = async (id, user) => {
  const order = await orderRepository.findById(id);
  assertOwned(order, user);
  const updated = await orderRepository.updateIfStatus(id, ORDER_STATUS.IN_PROGRESS, {
    status: ORDER_STATUS.COMPLETED,
    completedAt: new Date(),
  });
  if (!updated) throw new AppError('Seul un ordre en cours peut être terminé', 409);
  return getById(id, user);
};

const listOperators = () => userRepository.findOperators();

module.exports = { create, list, stats, getById, update, cancel, start, complete, listOperators };
