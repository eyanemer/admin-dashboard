import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ParkingCircle, 
  History, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Tableau de bord', path: '/', icon: LayoutDashboard },
    { name: 'Utilisateurs', path: '/users', icon: Users },
    { name: 'Cartes RFID', path: '/rfid', icon: CreditCard },
    { name: 'Supervision', path: '/parking', icon: ParkingCircle },
    { name: 'Historique', path: '/history', icon: History },
    { name: 'Statistiques', path: '/stats', icon: BarChart3 },
    { name: 'Tarifs', path: '/rates', icon: Settings },
    { name: 'Alertes', path: '/alerts', icon: AlertTriangle },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <ParkingCircle size={20} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">City Parking</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold transition-all
              ${isActive 
                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
