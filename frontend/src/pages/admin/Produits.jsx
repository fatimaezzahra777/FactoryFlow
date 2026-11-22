import { useMemo, useState } from 'react';
import { listProducts } from '../../api/productsApi';
import { listMaterials } from '../../api/materialsApi';
import { useFetch } from '../../hooks/useFetch';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Field from '../../components/Field';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Panel from '../../components/Panel';
import Table from '../../components/Table';
import ProductForm from '../../components/products/ProductForm';
import { materialIdOf } from '../../utils/products';

// Fonction stable (hors du composant) : requise par useFetch
const loadProducts = async () => {
  const [products, materials] = await Promise.all([listProducts({ limit: 100 }), listMaterials()]);
  return { products: products.data, materials };
};

export default function Produits() {
  const { data, error, loading, reload } = useFetch(loadProducts);
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState(null); // { type: 'create' | 'edit', product? }

  const materialsById = useMemo(
    () => Object.fromEntries((data?.materials ?? []).map((m) => [m._id, m])),
    [data]
  );

  // Calcul dérivé : liste filtrée par la recherche
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = data?.products ?? [];
    if (!q) return items;
    return items.filter((p) => p.reference.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
  }, [data, search]);

  const closePanel = () => setPanel(null);
  const handleSaved = () => { closePanel(); reload(); };

  const describe = (product) =>
    product.composition
      .map((c) => {
        const m = materialsById[materialIdOf(c)];
        return `${m?.name ?? 'Matière inconnue'} × ${c.quantite} ${m?.unite ?? ''}`.trim();
      })
      .join(', ');

  return (
    <>
      <PageHeader title="Produits">
        <Button onClick={() => setPanel({ type: 'create' })} disabled={loading || Boolean(error)}>Nouveau produit</Button>
      </PageHeader>

      {panel?.type === 'create' && (
        <Panel title="Nouveau produit">
          <ProductForm materials={data.materials} onSaved={handleSaved} onCancel={closePanel} />
        </Panel>
      )}
      {panel?.type === 'edit' && (
        <Panel title={`Modifier : ${panel.product.name}`}>
          <ProductForm key={panel.product._id} product={panel.product} materials={data.materials} onSaved={handleSaved} onCancel={closePanel} />
        </Panel>
      )}

      <div className="mb-4 max-w-sm">
        <Field label="Rechercher" placeholder="Référence ou nom" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState>{search ? 'Aucun résultat pour cette recherche.' : 'Aucun produit. Créez le premier.'}</EmptyState>
      )}
      {!loading && !error && filtered.length > 0 && (
        <Table head={['Réf.', 'Nom', 'Composition (par unité)', 'Actions']}>
          {filtered.map((p) => (
            <tr key={p._id} className="border-t border-line [&>td]:p-3">
              <td className="font-mono text-xs">{p.reference}</td>
              <td>{p.name}</td>
              <td className="text-muted">{describe(p)}</td>
              <td>
                <button className="min-h-11 px-2 text-brand hover:underline" onClick={() => setPanel({ type: 'edit', product: p })}>
                  Modifier
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
