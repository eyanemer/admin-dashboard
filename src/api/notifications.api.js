import api from './axios';

export const sendNotification = (data) => api.post('/notifications/send', data);
export const getSentNotifications = () => api.get('/notifications/sent');
export const getMyNotifications = () => api.get('/notifications/my');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
