import { useState } from 'react';
import { createProduct, updateProduct } from '../../api/productsApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Field from '../Field';
import Button from '../Button';
import ErrorMessage from '../ErrorMessage';
import CompositionEditor from './CompositionEditor';
import { materialIdOf } from '../../utils/products';


function validate(form, lines) {
  if (!form.reference.trim()) return 'La référence est obligatoire.';
  if (form.name.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
  if (lines.length === 0) return 'Un produit doit utiliser au moins une matière première.';
  const ids = lines.map((l) => l.matiere);
  if (new Set(ids).size !== ids.length) return 'Une matière ne peut figurer qu’une seule fois.';
  if (lines.some((l) => !(Number(l.quantite) > 0))) return 'Chaque quantité doit être strictement positive.';
  return '';
}

export default function ProductForm({ product, materials, onSaved, onCancel }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(() => ({
    reference: product?.reference ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
  }));
  const [lines, setLines] = useState(() =>
    (product?.composition ?? []).map((c) => ({ matiere: materialIdOf(c), quantite: String(c.quantite) }))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form, lines);
    if (problem) return setError(problem);

    const payload = {
      reference: form.reference.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      composition: lines.map((l) => ({ matiere: l.matiere, quantite: Number(l.quantite) })),
    };
    setError('');
    setSubmitting(true);
    try {
      if (isEdit) await updateProduct(product._id, payload);
      else await createProduct(payload);
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
      </div>
      <Field label="Description (facultative)" name="description" value={form.description} onChange={handleChange} />
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Composition</p>
      <CompositionEditor materials={materials} lines={lines} onChange={setLines} />
      <ErrorMessage message={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? 'Enregistrement…' : 'Enregistrer'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
