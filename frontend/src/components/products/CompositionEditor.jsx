import { useState } from 'react';
import Button from '../Button';
import Table from '../Table';
import EmptyState from '../EmptyState';

const selectClass = 'min-h-11 border border-field bg-surface px-3 text-sm text-white focus:outline-2 focus:outline-brand';

export default function CompositionEditor({ materials, lines, onChange }) {
  const [selected, setSelected] = useState('');
  const [quantite, setQuantite] = useState('');
  const [localError, setLocalError] = useState('');

  const byId = Object.fromEntries(materials.map((m) => [m._id, m]));
  const used = new Set(lines.map((l) => l.matiere));
  const available = materials.filter((m) => !used.has(m._id)); // une matière ne peut figurer qu'une fois

  const add = () => {
    const value = Number(quantite);
    if (!selected) return setLocalError('Choisissez une matière première.');
    if (quantite === '' || Number.isNaN(value) || value <= 0) {
      return setLocalError('La quantité par unité doit être strictement positive.');
    }
    setLocalError('');
    onChange([...lines, { matiere: selected, quantite }]);
    setSelected('');
    setQuantite('');
  };

  const updateQuantity = (id, value) =>
    onChange(lines.map((l) => (l.matiere === id ? { ...l, quantite: value } : l)));
  const remove = (id) => onChange(lines.filter((l) => l.matiere !== id));

  if (materials.length === 0) {
    return <EmptyState>Aucune matière première. Créez-en d’abord dans « Matières premières ».</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          Matière première
          <select className={selectClass} value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Choisir…</option>
            {available.map((m) => (
              <option key={m._id} value={m._id}>{m.name} ({m.unite})</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          Quantité par unité
          <input
            className={`${selectClass} w-36`}
            type="number" min="0" step="any"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
          />
        </label>
        <Button type="button" variant="ghost" onClick={add} disabled={available.length === 0}>Ajouter</Button>
      </div>
      {localError && <p role="alert" className="text-[13px] text-danger">{localError}</p>}

      {lines.length === 0 ? (
        <EmptyState>Ajoutez au moins une matière première.</EmptyState>
      ) : (
        <Table head={['Matière', 'Quantité par unité', '']}>
          {lines.map((l) => (
            <tr key={l.matiere} className="border-t border-line [&>td]:p-3">
              <td>{byId[l.matiere]?.name ?? 'Matière inconnue'}</td>
              <td>
                <div className="flex items-center gap-2">
                  <input
                    className={`${selectClass} w-28`}
                    type="number" min="0" step="any"
                    value={l.quantite}
                    onChange={(e) => updateQuantity(l.matiere, e.target.value)}
                    aria-label={`Quantité de ${byId[l.matiere]?.name ?? 'matière'}`}
                  />
                  <span className="text-muted">{byId[l.matiere]?.unite}</span>
                </div>
              </td>
              <td>
                <button type="button" className="min-h-11 px-2 text-danger hover:underline" onClick={() => remove(l.matiere)}>
                  Retirer
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
