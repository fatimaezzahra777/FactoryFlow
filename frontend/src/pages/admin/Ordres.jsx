import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

export default function Ordres() {
  return (
    <PageHeader title="Ordres de fabrication">
      <Link to="/admin/ordres/nouveau" className="inline-flex min-h-11 items-center bg-brand px-5 text-sm font-semibold text-ink">
        Nouvel ordre
      </Link>
    </PageHeader>
  );
}
