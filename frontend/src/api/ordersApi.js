import api from './axiosClient';

// listOrders renvoie le corps complet : { data: [...], pagination: {...} }
export const listOrders = async (params) => (await api.get('/api/orders', { params })).data;
export const getOrder = async (id) => (await api.get(`/api/orders/${id}`)).data.data;
export const createOrder = async (payload) => (await api.post('/api/orders', payload)).data.data;
export const updateOrder = async (id, payload) => (await api.put(`/api/orders/${id}`, payload)).data.data;
export const cancelOrder = async (id) => (await api.post(`/api/orders/${id}/cancel`)).data.data;
export const startOrder = async (id) => (await api.post(`/api/orders/${id}/start`)).data.data;
export const completeOrder = async (id) => (await api.post(`/api/orders/${id}/complete`)).data.data;
export const getOrderStats = async () => (await api.get('/api/orders/stats')).data.data;
export const listOperators = async () => (await api.get('/api/orders/operators')).data.data;
