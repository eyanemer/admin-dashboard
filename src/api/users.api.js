import api from './axios';

export const getUsers = () => api.get('/users/getAllUsers');
export const getUserById = (id) => api.get(`/users/getUserById/${id}`);
export const createUser = (userData) => api.post('/users/addUserAdmin', userData);
export const updateUser = (id, userData) => api.put(`/users/updateUser/${id}`, userData);
export const updateProfile = (profileData) => api.put('/users/updateProfile', profileData);
export const deleteUser = (id) => api.delete(`/users/deleteUser/${id}`);
