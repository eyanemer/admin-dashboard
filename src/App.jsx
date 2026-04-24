import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Users from './pages/Users';

// Composant pour protéger les routes d'administration
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route publique pour la connexion */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes protégées */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
              <Sidebar />
              {/* Contenu principal décalé à cause de la Sidebar fixe */}
              <main className="ml-64 p-10 min-h-screen">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={
                      <div className="space-y-6">
                        <h1 className="text-4xl font-bold">Dashboard Overview</h1>
                        <p className="text-[var(--text-muted)]">Bienvenue dans votre centre de contrôle du parking intelligent.</p>
                        
                        {/* Grille de stats temporaire pour le look */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[2rem] h-40 animate-pulse shadow-sm"></div>
                          ))}
                        </div>
                      </div>
                    } />
                    
                    <Route path="/users" element={<Users />} />
                    <Route path="/rfid" element={<h1 className="text-2xl font-bold">Gestion des Cartes RFID</h1>} />
                    <Route path="/parking" element={<h1 className="text-2xl font-bold">Supervision Parking</h1>} />
                    <Route path="/history" element={<h1 className="text-2xl font-bold">Historique des Sessions</h1>} />
                    <Route path="/stats" element={<h1 className="text-2xl font-bold">Statistiques</h1>} />
                    <Route path="/rates" element={<h1 className="text-2xl font-bold">Configuration des Tarifs</h1>} />
                    <Route path="/alerts" element={<h1 className="text-2xl font-bold">Alertes Système</h1>} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;