import { useState } from 'react';
import { addStockEntry } from '../../api/materialsApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { stockOf } from '../../utils/stock';
import Field from '../Field';
import Button from '../Button';
import ErrorMessage from '../ErrorMessage';

export default function StockEntryForm({ material, onSaved, onCancel }) {
  const [quantite, setQuantite] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Number(quantite);
    if (quantite === '' || Number.isNaN(value) || value <= 0) {
      return setError('La quantité doit être strictement positive.');
    }
    setError('');
    setSubmitting(true);
    try {
      await addStockEntry({ matiere: material._id, quantite: value });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <p className="text-[13px] text-muted">Stock actuel : {stockOf(material)} {material.unite}</p>
      <div className="max-w-xs">
        <Field label={`Quantité reçue (${material.unite})`} type="number" min="0" step="any" value={quantite} onChange={(e) => setQuantite(e.target.value)} />
      </div>
      <ErrorMessage message={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? 'Enregistrement…' : "Enregistrer l'entrée"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
