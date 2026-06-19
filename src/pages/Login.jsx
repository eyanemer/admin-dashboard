import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4 py-6">
      <div className="w-full min-h-screen max-w-full">
        <div className="min-h-screen grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
          <div className="flex h-full flex-col justify-center bg-white border border-slate-200 shadow-2xl rounded-[2rem] p-8 md:p-12">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black text-slate-900">Connexion</h1>
              <p className="mt-3 text-sm text-slate-500">Connectez-vous pour accéder à votre espace administrateur.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-[0.26em] text-slate-400">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="admin@cityparking.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-[0.26em] text-slate-400">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Rester connecté
                </label>
                <button type="button" className="font-semibold text-blue-600 hover:underline">Mot de passe oublié ?</button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Vous n’avez pas de compte ?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-semibold text-blue-600 hover:underline"
              >
                S'inscrire
              </button>
            </p>
          </div>

          <div className="hidden lg:flex h-full flex-col justify-start rounded-[2rem] bg-[#0b1a3a] p-10 text-white shadow-2xl overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_25%)]" />
            <div className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative text-center pt-6">
              <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white shadow-lg shadow-blue-950/20">
                <img src={logo} alt="CityParking logo" className="h-20 w-20 object-contain" />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">CityParking</p>
              <h2 className="mt-4 text-5xl font-black text-white">Bienvenue</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">Gestion de parking et administration en temps réel.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
