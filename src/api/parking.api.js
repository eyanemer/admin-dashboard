import api from './axios';

export const getParkingStatus = () => api.get('/parking/status');
export const updateSpotStatus = (id, status) => api.put(`/parking/spots/${id}`, { status });
