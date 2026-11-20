import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getInstallationStatus, installAdmin } from '../api/installationApi';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+$/;

function validate({ name, email, password, confirm }) {
  if (name.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
  if (!EMAIL_RE.test(email.trim())) return 'Adresse email invalide.';
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (password !== confirm) return 'Les mots de passe ne correspondent pas.';
  return '';
}

export default function Install() {
  const navigate = useNavigate();
  const [installed, setInstalled] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getInstallationStatus()
      .then(setInstalled)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) return setError(problem);

    setError('');
    setSubmitting(true);
    try {
      await installAdmin({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate('/login', {
        replace: true,
        state: { message: 'Compte administrateur créé. Vous pouvez vous connecter.' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (installed === true) return <Navigate to="/login" replace />;
  if (installed === null && !error) return <Loader />;

  return (
    <AuthLayout title="Installation de FactoryFlow">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <p className="text-[13px] text-muted">
          Créez le premier compte Administrateur. Cette étape n’est possible qu’une seule fois.
        </p>
        <Field label="Nom complet" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
        <Field label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
        <Field label="Confirmer le mot de passe" name="confirm" type="password" value={form.confirm} onChange={handleChange} autoComplete="new-password" />
        <ErrorMessage message={error} />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le compte Admin'}
        </Button>
      </form>
    </AuthLayout>
  );
}