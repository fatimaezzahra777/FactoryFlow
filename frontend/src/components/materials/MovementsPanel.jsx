import { useCallback, useState } from 'react';
import { listMovements } from '../../api/materialsApi';
import { useFetch } from '../../hooks/useFetch';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import EmptyState from '../EmptyState';
import Table from '../Table';
import Button from '../Button';
import Badge from '../Badge';

const LIMIT = 5;

export default function MovementsPanel({ material, onClose }) {
  const [page, setPage] = useState(1);
  const fetcher = useCallback(
    () => listMovements({ matiere: material._id, page, limit: LIMIT }),
    [material._id, page]
  );
  const { data, error, loading } = useFetch(fetcher);
  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loader />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && items.length === 0 && <EmptyState>Aucun mouvement pour cette matière.</EmptyState>}
      {!loading && !error && items.length > 0 && (
        <Table head={['Date', 'Type', 'Quantité']}>
          {items.map((m, i) => (
            <tr key={m._id ?? `${m.createdAt}-${i}`} className="border-t border-line [&>td]:p-3">
              <td>{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
              <td>
                <Badge tone={m.type === 'ENTRY' ? 'ok' : 'muted'}>{m.type === 'ENTRY' ? 'Entrée' : 'Sortie'}</Badge>
              </td>
              <td>{m.type === 'ENTRY' ? '+' : '−'}{m.quantite} {material.unite}</td>
            </tr>
          ))}
        </Table>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
        <span className="text-[13px] text-muted">Page {page}{pagination ? ` sur ${pagination.totalPages || 1}` : ''}</span>
        <Button variant="ghost" disabled={!pagination || page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        <Button variant="ghost" className="ml-auto" onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
}
