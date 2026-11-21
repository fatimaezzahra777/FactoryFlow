import api from './axiosClient';

// renvoie le corps complet : { data: [...], pagination?: {...} }
export const listProducts = async () => (await api.get('/api/products')).data;
