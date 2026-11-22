import api from './axiosClient';

// renvoie le corps complet : { data: [...], pagination: {...} }
export const listProducts = async (params) => (await api.get('/api/products', { params })).data;
export const createProduct = async (payload) => (await api.post('/api/products', payload)).data.data;
export const updateProduct = async (id, payload) => (await api.put(`/api/products/${id}`, payload)).data.data;
