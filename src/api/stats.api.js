import api from './axios';

export const getGlobalStats = () => api.get('/stats/global');
export const getRevenueStats = (period = 'month') => api.get(`/stats/revenue?period=${period}`);
export const getOccupancyStats = (period = 'month') => api.get(`/stats/occupancy?period=${period}`);
