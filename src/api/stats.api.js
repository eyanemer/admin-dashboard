import api from './axios';

export const getGlobalStats = () => api.get('/stats/global');
export const getRevenueStats = () => api.get('/stats/revenue');
export const getOccupancyStats = () => api.get('/stats/occupancy');
