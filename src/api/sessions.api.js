import api from './axios';

export const getSessions = () => api.get('/sessions');
export const getActiveSessions = () => api.get('/sessions/active');
export const deleteSession = (id) => api.delete(`/sessions/${id}`);
