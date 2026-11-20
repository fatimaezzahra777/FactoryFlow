import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';

export default function PrivateRoute({ roles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/acces-refuse" replace />;
  }
  return <Outlet />;
}
