import api from './axiosClient';

export const getInstallationStatus = async () => {
  const res = await api.get('/api/installation/status');
  return res.data.data.installed;
};

export const installAdmin = async (payload) => {
  const res = await api.post('/api/installation', payload);
  return res.data.data;
};
