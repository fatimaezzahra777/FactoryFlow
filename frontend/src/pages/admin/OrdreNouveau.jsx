import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder, listOperators } from '../../api/ordersApi';
import { listProducts } from '../../api/productsApi';
import { listMaterials } from '../../api/materialsApi';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { stockOf } from '../../utils/stock';
import { computeRequirements } from '../../utils/requirements';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

const selectClass = 'min-h-11 border border-field bg-surface px-3 text-sm text-white focus:outline-2 focus:outline-brand';

// Fonction stable (hors du composant) : requise par useFetch
const loadFormData = async () => {
  const [products, materials, operators] = await Promise.all([
    listProducts({ limit: 100 }),
    listMaterials(),
    listOperators(),
  ]);
  return { products: products.data, materials, operators };
};

export default function OrdreNouveau() {
  const navigate = useNavigate();
  const { data, error: loadError, loading } = useFetch(loadFormData);
  const [lines, setLines] = useState([]); // [{ produit, quantite }]
  const [selected, setSelected] = useState('');
  const [quantite, setQuantite] = useState('');
  const [operator, setOperator] = useState('');
  const [localError, setLocalError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const productsById = useMemo(() => Object.fromEntries((data?.products ?? []).map((p) => [p._id, p])), [data]);
  const materialsById = useMemo(() => Object.fromEntries((data?.materials ?? []).map((m) => [m._id, m])), [data]);

  // Calcul dérivé : besoins agrégés par matière, comparés au stock disponible
  const requirements = useMemo(
    () =>
      computeRequirements(lines, productsById).map((r) => {
        const material = materialsById[r.matiere];
        const stock = material ? stockOf(material) : 0;
        return { ...r, name: material?.name ?? 'Matière inconnue', unite: material?.unite ?? '', stock, missing: stock < r.quantite };
      }),
    [lines, productsById, materialsById]
  );
  const hasShortage = requirements.some((r) => r.missing);

  if (loading) return <Loader />;
  if (loadError) return <ErrorMessage message={loadError} />;

  const used = new Set(lines.map((l) => l.produit));
  const available = data.products.filter((p) => !used.has(p._id)); // un produit ne figure qu'une fois

  const addLine = () => {
    const value = Number(quantite);
    if (!selected) return setLocalError('Choisissez un produit.');
    if (quantite === '' || Number.isNaN(value) || value <= 0) {
      return setLocalError('La quantité doit être strictement positive.');
    }
    setLocalError('');
    setLines((prev) => [...prev, { produit: selected, quantite }]);
    setSelected('');
    setQuantite('');
  };
  const updateQuantity = (id, value) => setLines((prev) => prev.map((l) => (l.produit === id ? { ...l, quantite: value } : l)));
  const removeLine = (id) => setLines((prev) => prev.filter((l) => l.produit !== id));

  const handleSubmit = async () => {
    if (lines.length === 0) return setError('Un ordre doit contenir au moins un produit.');
    if (lines.some((l) => !(Number(l.quantite) > 0))) return setError('Chaque quantité doit être strictement positive.');
    setError('');
    setSubmitting(true);
    try {
      await createOrder({
        lines: lines.map((l) => ({ produit: l.produit, quantite: Number(l.quantite) })),
        operator: operator || null,
      });
      navigate('/admin/ordres');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Nouvel ordre de fabrication">
        <Link to="/admin/ordres" className="text-sm text-brand hover:underline">← Retour aux ordres</Link>
      </PageHeader>

      <Panel title="Produits à fabriquer">
        {data.products.length === 0 ? (
          <EmptyState>Aucun produit. Créez d’abord un produit.</EmptyState>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-[13px] text-muted">
              Produit
              <select className={selectClass} value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">Choisir…</option>
                {available.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.reference})</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-muted">
              Quantité à fabriquer
              <input className={`${selectClass} w-36`} type="number" min="0" step="any" value={quantite} onChange={(e) => setQuantite(e.target.value)} />
            </label>
            <Button type="button" variant="ghost" onClick={addLine} disabled={available.length === 0}>Ajouter</Button>
          </div>
        )}
        {localError && <p role="alert" className="text-[13px] text-danger">{localError}</p>}

        {lines.length === 0 ? (
          <EmptyState>Ajoutez au moins un produit.</EmptyState>
        ) : (
          <Table head={['Produit', 'Quantité', '']}>
            {lines.map((l) => (
              <tr key={l.produit} className="border-t border-line [&>td]:p-3">
                <td>{productsById[l.produit]?.name}</td>
                <td>
                  <input
                    className={`${selectClass} w-28`} type="number" min="0" step="any" value={l.quantite}
                    onChange={(e) => updateQuantity(l.produit, e.target.value)}
                    aria-label={`Quantité de ${productsById[l.produit]?.name}`}
                  />
                </td>
                <td>
                  <button type="button" className="min-h-11 px-2 text-danger hover:underline" onClick={() => removeLine(l.produit)}>Retirer</button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Besoins totaux en matières premières">
        {requirements.length === 0 ? (
          <EmptyState>Les besoins apparaissent dès qu’un produit est ajouté.</EmptyState>
        ) : (
          <>
            <Table head={['Matière', 'Besoin', 'Stock disponible', 'État']}>
              {requirements.map((r) => (
                <tr key={r.matiere} className="border-t border-line [&>td]:p-3">
                  <td>{r.name}</td>
                  <td>{r.quantite} {r.unite}</td>
                  <td>{r.stock} {r.unite}</td>
                  <td>{r.missing ? <Badge tone="danger">Insuffisant</Badge> : <Badge tone="ok">OK</Badge>}</td>
                </tr>
              ))}
            </Table>
            {hasShortage && (
              <p role="status" className="bg-danger-bg px-3 py-2.5 text-[13px] text-danger">
                Stock insuffisant : l’ordre peut être créé, mais son démarrage sera refusé tant que le stock manque.
              </p>
            )}
          </>
        )}
      </Panel>

      <Panel title="Affectation">
        <label className="flex max-w-sm flex-col gap-1.5 text-[13px] text-muted">
          Opérateur (facultatif)
          <select className={selectClass} value={operator} onChange={(e) => setOperator(e.target.value)}>
            <option value="">Non affecté</option>
            {data.operators.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
        </label>
        <ErrorMessage message={error} />
        <div className="flex gap-3">
          <Button type="button" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Création…' : 'Créer l’ordre'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/ordres')}>Annuler</Button>
        </div>
      </Panel>
    </>
  );
}
