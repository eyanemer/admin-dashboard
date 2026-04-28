import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Topbar = () => {
  const location = useLocation();
  const { user } = useAuth();

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
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
      <h2 className="text-base font-semibold text-slate-900">{getPageTitle()}</h2>

      <div className="flex items-center gap-5">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 h-9 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-slate-500 mt-1">{user?.role || 'Administrateur'}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
