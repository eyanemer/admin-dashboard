import api from './axios';

export const getRFIDs = () => api.get('/cartes');
export const createRFID = (data) => api.post('/cartes', data);
export const deleteRFID = (id) => api.delete(`/cartes/${id}`);
export const activerRFID = (id) => api.put(`/cartes/activer/${id}`);
export const desactiverRFID = (id) => api.put(`/cartes/desactiver/${id}`);
