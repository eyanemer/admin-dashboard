import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import CarteRFID from './pages/CarteRFID';
import Parking from './pages/Parking';
import Historique from './pages/Historique';
import Statistiques from './pages/Statistiques';
import Tarifs from './pages/Tarifs';
import Alertes from './pages/Alertes';
import Loader from './components/ui/Loader';

/**
 * Composant pour protéger les routes d'administration.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loader fullScreen />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/rfid" element={<ProtectedRoute><CarteRFID /></ProtectedRoute>} />
          <Route path="/parking" element={<ProtectedRoute><Parking /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Statistiques /></ProtectedRoute>} />
          <Route path="/rates" element={<ProtectedRoute><Tarifs /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alertes /></ProtectedRoute>} />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;