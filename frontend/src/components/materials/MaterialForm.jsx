import { useState } from 'react';
import { createMaterial, updateMaterial } from '../../api/materialsApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Field from '../Field';
import Button from '../Button';
import ErrorMessage from '../ErrorMessage';

const EMPTY = { reference: '', name: '', unite: '', seuilAlerte: '0', stockInitial: '0' };
const toNumber = (value) => Number(value === '' ? 0 : value);

function validate(form, isEdit) {
  if (!form.reference.trim()) return 'La référence est obligatoire.';
  if (form.name.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
  if (!form.unite.trim()) return "L'unité est obligatoire (kg, L, pièce…).";
  const seuil = toNumber(form.seuilAlerte);
  if (Number.isNaN(seuil) || seuil < 0) return "Le seuil d'alerte doit être un nombre positif ou nul.";
  if (!isEdit) {
    const stock = toNumber(form.stockInitial);
    if (Number.isNaN(stock) || stock < 0) return 'Le stock initial doit être un nombre positif ou nul.';
  }
  return '';
}

export default function MaterialForm({ material, onSaved, onCancel }) {
  const isEdit = Boolean(material);
  const [form, setForm] = useState(() =>
    isEdit
      ? { reference: material.reference, name: material.name, unite: material.unite, seuilAlerte: String(material.seuilAlerte) }
      : EMPTY
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form, isEdit);
    if (problem) return setError(problem);

    const payload = {
      reference: form.reference.trim(),
      name: form.name.trim(),
      unite: form.unite.trim(),
      seuilAlerte: toNumber(form.seuilAlerte),
    };
    setError('');
    setSubmitting(true);
    try {
      if (isEdit) await updateMaterial(material._id, payload);
      else await createMaterial({ ...payload, stockInitial: toNumber(form.stockInitial) });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Référence (unique)" name="reference" value={form.reference} onChange={handleChange} />
        <Field label="Nom" name="name" value={form.name} onChange={handleChange} />
        <Field label="Unité (kg, L, pièce…)" name="unite" value={form.unite} onChange={handleChange} />
        <Field label="Seuil d'alerte" name="seuilAlerte" type="number" min="0" step="any" value={form.seuilAlerte} onChange={handleChange} />
        {!isEdit && (
          <Field label="Stock initial" name="stockInitial" type="number" min="0" step="any" value={form.stockInitial} onChange={handleChange} />
        )}
      </div>
      <ErrorMessage message={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? 'Enregistrement…' : 'Enregistrer'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
