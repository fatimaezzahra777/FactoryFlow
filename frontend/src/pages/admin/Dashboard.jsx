import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listMaterials } from '../../api/materialsApi';
import { listProducts } from '../../api/productsApi';
import { getOrderStats } from '../../api/ordersApi';
import { useFetch } from '../../hooks/useFetch';
import { stockOf, isLow } from '../../utils/stock';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Panel from '../../components/Panel';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

const STATUS_LABELS = {
  PLANNED: 'Planifié',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

// Fonction stable (hors du composant) : requise par useFetch
const loadDashboard = async () => {
  const [materials, products, orders] = await Promise.all([
    listMaterials(),
    listProducts({ limit: 1 }),
    getOrderStats(),
  ]);
  return { materials, productCount: products.pagination?.total ?? 0, orders };
};

export default function Dashboard() {
  const { data, error, loading } = useFetch(loadDashboard);

  // Calcul dérivé : matières sous leur seuil d'alerte
  const lowMaterials = useMemo(() => (data?.materials ?? []).filter(isLow), [data]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <PageHeader title="Tableau de bord" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Produits" value={data.productCount} />
        <StatCard label="Matières premières" value={data.materials.length} hint={`${lowMaterials.length} sous le seuil`} />
        <StatCard label="Ordres" value={data.orders.total} />
      </div>

      <Panel title="Ordres par statut">
        <div className="grid gap-4 sm:grid-cols-4">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="border border-line p-4">
              <p className="text-[13px] text-muted">{label}</p>
              <p className="text-2xl font-light">{data.orders.byStatus[status] ?? 0}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Alertes de stock">
        {lowMaterials.length === 0 ? (
          <EmptyState>Aucune matière sous son seuil d’alerte.</EmptyState>
        ) : (
          <Table head={['Matière', 'Stock', 'Seuil', 'État']}>
            {lowMaterials.map((m) => (
              <tr key={m._id} className="border-t border-line [&>td]:p-3">
                <td>{m.name} <span className="font-mono text-xs text-muted">{m.reference}</span></td>
                <td>{stockOf(m)} {m.unite}</td>
                <td>{m.seuilAlerte} {m.unite}</td>
                <td><Badge tone="danger">Sous le seuil</Badge></td>
              </tr>
            ))}
          </Table>
        )}
        <Link to="/admin/matieres" className="text-sm text-brand hover:underline">
          Gérer les matières premières →
        </Link>
      </Panel>
    </>
  );
}
