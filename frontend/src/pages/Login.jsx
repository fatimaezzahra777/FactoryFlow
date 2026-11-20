import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { login as loginRequest } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { HOME_BY_ROLE } from '../constants/roles';
import { getErrorMessage } from '../utils/getErrorMessage';
import ErrorMessage from '../components/ErrorMessage';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';

export default function Login() {
  const { isAuthenticated, role, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={HOME_BY_ROLE[role] ?? '/'} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) return setError('Email et mot de passe obligatoires.');

    setError('');
    setSubmitting(true);
    try {
      const { token, user } = await loginRequest({ email, password: form.password });
      login(token, user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Connexion">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {location.state?.message && (
          <div className="bg-ok-bg px-3 py-2.5 text-[13px] text-ok">{location.state.message}</div>
        )}
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
        <Field label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
        <ErrorMessage message={error} />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
);
}
