import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

/**
 * Provider global pour gérer l'état de l'utilisateur et l'authentification.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un token existe au chargement
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // On pourrait appeler un endpoint /auth/me pour vérifier le token
          // Pour l'instant, on simule ou on décode si nécessaire
          const userStr = localStorage.getItem('user');
          if (userStr && userStr !== 'undefined') {
            const savedUser = JSON.parse(userStr);
            if (savedUser) setUser(savedUser);
          }
        } catch (error) {
          console.error("Erreur de vérification d'auth", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Fonction de connexion
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success('Connexion réussie !');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Identifiants invalides';
      toast.error(message);
      return false;
    }
  };

  /**
   * Fonction de déconnexion
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Déconnexion effectuée');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
