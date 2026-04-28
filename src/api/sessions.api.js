import api from './axios';

export const getSessions = () => api.get('/sessions');
export const getActiveSessions = () => api.get('/sessions/active');
