import { useMemo, useState } from 'react';
import { listMaterials } from '../../api/materialsApi';
import { useFetch } from '../../hooks/useFetch';
import { stockOf, isLow } from '../../utils/stock';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Field from '../../components/Field';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import Panel from '../../components/Panel';
import Table from '../../components/Table';
import MaterialForm from '../../components/materials/MaterialForm';
import StockEntryForm from '../../components/materials/StockEntryForm';
import MovementsPanel from '../../components/materials/MovementsPanel';

export default function Matieres() {
  const { data, error, loading, reload } = useFetch(listMaterials);
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState(null); // { type: 'create' | 'edit' | 'entry' | 'history', material? }

  // Calcul dérivé : liste filtrée par la recherche
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = data ?? [];
    if (!q) return items;
    return items.filter((m) => m.reference.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
  }, [data, search]);

  const lowCount = useMemo(() => (data ?? []).filter(isLow).length, [data]);

  const closePanel = () => setPanel(null);
  const handleSaved = () => { closePanel(); reload(); };
  const open = (type, material) => setPanel({ type, material });

  return (
    <>
      <PageHeader title="Matières premières">
        <Button onClick={() => open('create')}>Nouvelle matière</Button>
      </PageHeader>

      {panel?.type === 'create' && (
        <Panel title="Nouvelle matière première">
          <MaterialForm onSaved={handleSaved} onCancel={closePanel} />
        </Panel>
      )}
      {panel?.type === 'edit' && (
        <Panel title={`Modifier : ${panel.material.name}`}>
          <MaterialForm key={panel.material._id} material={panel.material} onSaved={handleSaved} onCancel={closePanel} />
        </Panel>
      )}
      {panel?.type === 'entry' && (
        <Panel title={`Entrée de stock : ${panel.material.name}`}>
          <StockEntryForm key={panel.material._id} material={panel.material} onSaved={handleSaved} onCancel={closePanel} />
        </Panel>
      )}
      {panel?.type === 'history' && (
        <Panel title={`Historique des mouvements : ${panel.material.name}`}>
          <MovementsPanel key={panel.material._id} material={panel.material} onClose={closePanel} />
        </Panel>
      )}

      {lowCount > 0 && (
        <div className="mb-4 bg-danger-bg px-3 py-2.5 text-[13px] text-danger" role="status">
          {lowCount} matière{lowCount > 1 ? 's' : ''} sous le seuil d’alerte.
        </div>
      )}

      <div className="mb-4 max-w-sm">
        <Field label="Rechercher" placeholder="Référence ou nom" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState>{search ? 'Aucun résultat pour cette recherche.' : 'Aucune matière première. Créez la première.'}</EmptyState>
      )}
      {!loading && !error && filtered.length > 0 && (
        <Table head={['Réf.', 'Nom', 'Stock', 'Seuil', 'État', 'Actions']}>
          {filtered.map((m) => (
            <tr key={m._id} className="border-t border-line [&>td]:p-3">
              <td className="font-mono text-xs">{m.reference}</td>
              <td>{m.name}</td>
              <td>{stockOf(m)} {m.unite}</td>
              <td>{m.seuilAlerte} {m.unite}</td>
              <td>{isLow(m) ? <Badge tone="danger">Sous le seuil</Badge> : <Badge tone="ok">OK</Badge>}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  <button className="min-h-11 px-2 text-brand hover:underline" onClick={() => open('edit', m)}>Modifier</button>
                  <button className="min-h-11 px-2 text-brand hover:underline" onClick={() => open('entry', m)}>Entrée</button>
                  <button className="min-h-11 px-2 text-brand hover:underline" onClick={() => open('history', m)}>Historique</button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
