import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Settings, LogOut, Save, Eye, EyeOff, X, Mail, Phone, Lock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { updateProfile } from '../../api/users.api';
import { getAlertes } from '../../api/alertes.api';
import { useSocket } from '../../context/SocketContext';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await getAlertes();
      setUnreadCount(response.data.filter(a => !a.estLue).length);
    } catch (err) {
      console.error("Erreur unread alert count", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('alerte_new', (alert) => {
        setUnreadCount(prev => prev + 1);
        
        // Notification Toast haut de gamme
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 border-l-4 ${alert.niveau === 'critique' ? 'border-l-red-500' : 'border-l-orange-500'} transition-all duration-300`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  {alert.niveau === 'critique' ? (
                    <ShieldAlert className="h-10 w-10 text-red-500 bg-red-50 p-2 rounded-xl animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-10 w-10 text-orange-500 bg-orange-50 p-2 rounded-xl" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alerte Système Live</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{alert.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-100">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl px-4 py-2 flex items-center justify-center text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                Fermer
              </button>
            </div>
          </div>
        ), { duration: 6000 });
      });

      return () => {
        socket.off('alerte_new');
      };
    }
  }, [socket]);

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone
      };

      // Si un nouveau mot de passe est fourni
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          toast.error('Veuillez saisir votre mot de passe actuel.');
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      const response = await updateProfile(updateData);

      // Mettre à jour l'utilisateur dans le contexte
      setUser(response.data.user || response.data);

      // Mettre à jour localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data));

      toast.success('Profil mis à jour avec succès !');

      // Fermer la modal et réinitialiser les champs de mot de passe
      setShowProfileModal(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Retourner au tableau de bord (Dashboard)
      navigate('/');

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tableau de bord';
      case '/users': return 'Utilisateurs';
      case '/rfid': return 'Cartes RFID';
      case '/parking': return 'Supervision';
      case '/history': return 'Historique';
      case '/stats': return 'Statistiques';
      case '/rates': return 'Tarifs';
      case '/alerts': return 'Alertes';
      default: return 'Administration';
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
        <h2 className="text-base font-semibold text-slate-900">{getPageTitle()}</h2>

        <div className="flex items-center gap-5">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher des utilisateurs..." 
              className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 h-9 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/users?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/alerts')}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors relative"
              title="Centre d'Alertes"
            >
              <Bell size={20} className={unreadCount > 0 ? 'animate-bounce text-red-500' : ''} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-[8px] font-black h-4.5 w-4.5 flex items-center justify-center border border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-lg p-2 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-slate-500 mt-1">{user?.role || 'Administrateur'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.name?.[0] || 'A'}
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User size={16} />
                    <span>Mon Profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Ici on pourrait ajouter des paramètres ou autres
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Paramètres</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal du profil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Modifier mon profil</h2>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Votre prénom"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Votre nom"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="votre.email@email.com"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" 
                      placeholder="+216 -- --- ---"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-black text-slate-900 mb-4">Changer le mot de passe</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe actuel"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-12 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nouveau mot de passe"
                          className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirmer le mot de passe"
                          className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
