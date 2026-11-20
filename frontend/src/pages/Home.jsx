import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getInstallationStatus } from '../api/installationApi';
import { useAuth } from '../hooks/useAuth';
import { HOME_BY_ROLE } from '../constants/roles';
import { getErrorMessage } from '../utils/getErrorMessage';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const { isAuthenticated, role, loading } = useAuth();
  const [installed, setInstalled] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getInstallationStatus()
      .then(setInstalled)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to={HOME_BY_ROLE[role] ?? '/login'} replace />;
  if (error) return <div className="page"><ErrorMessage message={error} /></div>;
  if (installed === null) return <Loader />;
  return <Navigate to={installed ? '/login' : '/install'} replace />;
}
