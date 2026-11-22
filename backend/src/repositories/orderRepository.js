const Order = require('../models/Order');
const Counter = require('../models/Counter');

const POPULATE_DETAIL = [
  { path: 'operator', select: 'name email' },
  { path: 'lines.composition.matiere', select: 'reference name unite' },
];

// Numéro séquentiel, incrémenté dans la même transaction que la création
const nextNumber = async (session) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'order' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', session }
  );
  return `OF-${String(counter.seq).padStart(4, '0')}`;
};

const create = (data, session) =>
  Order.create([data], { session }).then(([order]) => order);

const findById = (id, session) => Order.findById(id).session(session || null);

const findDetailed = (id) => Order.findById(id).populate(POPULATE_DETAIL);

const findPage = async (filter, { page, limit }) => {
  const [items, total] = await Promise.all([
    Order.find(filter)
      .select('-lines.composition')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'operator', select: 'name email' }),
    Order.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

// Mise à jour CONDITIONNELLE au statut courant : retourne null si le statut ne correspond pas.
// C'est ce qui garantit qu'une transition (démarrer, annuler...) ne se produit qu'une fois.
const updateIfStatus = (id, status, data, session) =>
  Order.findOneAndUpdate({ _id: id, status }, data, {
    returnDocument: 'after',
    runValidators: true,
    session,
  });

const countByStatus = () =>
  Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

module.exports = {
  nextNumber,
  create,
  findById,
  findDetailed,
  findPage,
  updateIfStatus,
  countByStatus,
};
