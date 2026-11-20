import api from './axiosClient';

export const login = async (credentials) => {
  const res = await api.post('/api/auth/login', credentials);
  return res.data.data; // { token, user }
};

export const getProfile = async () => {
  const res = await api.get('/api/auth/me');
  return res.data.data;
};
