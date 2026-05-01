import api from './axios';

/**
 * Récupérer tous les abonnements (Admin)
 */
export const getAllAbonnements = () => api.get('/abonnements/all');

/**
 * Créer un nouvel abonnement
 */
export const createAbonnement = (data) => api.post('/abonnements/creer', data);

/**
 * Désactiver un abonnement (Admin)
 */
export const deactivateAbonnement = (id) => api.put(`/abonnements/desactiver/${id}`);

/**
 * Supprimer un abonnement (Admin)
 */
export const deleteAbonnement = (id) => api.delete(`/abonnements/${id}`);
