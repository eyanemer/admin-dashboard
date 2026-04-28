import api from './axios';

export const getAlertes = () => api.get('/alertes');
export const markAlerteAsRead = (id) => api.put(`/alertes/${id}/lire`);
export const deleteAlerte = (id) => api.delete(`/alertes/${id}`);
