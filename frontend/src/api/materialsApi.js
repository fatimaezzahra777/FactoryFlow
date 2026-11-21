import api from './axiosClient';

export const listMaterials = async () => (await api.get('/api/raw-materials')).data.data;
export const createMaterial = async (payload) => (await api.post('/api/raw-materials', payload)).data.data;
export const updateMaterial = async (id, payload) => (await api.put(`/api/raw-materials/${id}`, payload)).data.data;
export const addStockEntry = async (payload) => (await api.post('/api/stock/entries', payload)).data.data;
// renvoie { data: [...], pagination: {...} }
export const listMovements = async (params) => (await api.get('/api/stock/movements', { params })).data;
