import { useState } from 'react';
import { AuthContext } from './AuthContext';

function readStoreUser(){
    try{
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => readStoreUser());

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = { token, user, role: user?.role, isAuthenticated: Boolean(token), login, logout
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}