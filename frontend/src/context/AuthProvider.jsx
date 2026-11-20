import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getProfile } from '../api/authApi';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  // Au démarrage : si un token existe, le rôle vient du serveur (GET /auth/me)
  useEffect(() => {
    if (!localStorage.getItem('token')) return undefined;
    let cancelled = false;
    getProfile()
      .then((profile) => { if (!cancelled) setUser(profile); })
      .catch(() => {
        localStorage.removeItem('token');
        if (!cancelled) setToken(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    role: user?.role,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
