import api from './axios';

export const getTarifs = () => api.get('/tarifs');
export const updateTarif = (id, data) => api.put(`/tarifs/${id}`, data);
export const createTarif = (data) => api.post('/tarifs', data);
