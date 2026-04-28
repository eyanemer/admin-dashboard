import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Hook personnalisé pour utiliser facilement le contexte d'authentification.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export default useAuth;
