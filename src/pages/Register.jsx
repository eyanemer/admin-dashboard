import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { register as registerApi } from '../api/auth.api';
import logo from '../assets/logo.png';

const Register = () => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accept) {
      toast.error('Veuillez accepter les conditions avant de continuer.');
      return;
    }

    setIsLoading(true);
    try {
      await registerApi({ firstName: prenom, lastName: nom, email, password });
      toast.success('Inscription réussie, vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Impossible de créer le compte.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4 py-6">
      <div className="w-full min-h-screen max-w-full">
        <div className="min-h-screen grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
          <div className="flex h-full flex-col justify-center bg-white border border-slate-200 shadow-2xl rounded-[2rem] p-8 md:p-12">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black text-slate-900">Créer un compte</h1>
              <p className="mt-3 text-sm text-slate-500">Créez votre compte administrateur pour gérer le parking.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.26em] text-slate-400">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Entrez votre prénom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.26em] text-slate-400">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Entrez votre nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-[0.26em] text-slate-400">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Entrez votre email"
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
                    type="password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-slate-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                />
                J’accepte les Conditions générales et la Politique de confidentialité.
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Inscription...' : "Créer mon compte"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-blue-600 hover:underline"
              >
                Se connecter
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

export default Register;
