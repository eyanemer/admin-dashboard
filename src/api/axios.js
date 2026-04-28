import axios from 'axios';

/**
 * Instance Axios de base pour communiquer avec l'API.
 * On définit l'URL de base et les en-têtes communs.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête : ajoute le token d'authentification 
 * s'il est présent dans le localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse : gère les erreurs globales 
 * (ex: redirection si le token est expiré).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionnel : Déconnexion automatique si 401
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
