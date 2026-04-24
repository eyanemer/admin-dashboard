import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Correction du port (5000 au lieu de 3000)
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
