import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ChevronRight, UserPlus, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) navigate('/');
      } else {
        // Mock signup for admin (usually restricted)
        toast.error("La création de compte administrateur est restreinte par le système.");
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("Échec de l'authentification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] animate-fade-in">
        <div className="text-center mb-10">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-20 w-auto mx-auto mb-6 drop-shadow-xl" 
          />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">City Parking</h1>
          <p className="text-xs font-bold text-slate-400 mt-2 tracking-[0.3em] uppercase">Plateforme Administration</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            {isLogin ? <LogIn className="text-blue-600" /> : <UserPlus className="text-blue-600" />}
            {isLogin ? 'Connexion Admin' : 'Créer un compte'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 h-14 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Votre nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Professionnel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 h-14 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="admin@cityparking.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 h-14 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-2xl h-14 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Accéder au Dashboard' : 'Finaliser Inscription'}</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isLogin ? "Demander un accès admin" : "Retour à la connexion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
