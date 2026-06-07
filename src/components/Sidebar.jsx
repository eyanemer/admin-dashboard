import { 
  LayoutDashboard, Users, CreditCard, Car, 
  History, BarChart3, Settings, AlertCircle, LogOut,
  Sun, Moon 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/' },
    { icon: <Users size={20}/>, label: 'Utilisateurs', path: '/users' },
    { icon: <CreditCard size={20}/>, label: 'Cartes RFID', path: '/rfid' },
    { icon: <Car size={20}/>, label: 'Supervision Parking', path: '/parking' },
    { icon: <History size={20}/>, label: 'Historique des stationnements', path: '/history' },
    { icon: <BarChart3 size={20}/>, label: 'Statistiques', path: '/stats' },
    { icon: <Settings size={20}/>, label: 'Tarifs', path: '/rates' },
    { icon: <AlertCircle size={20}/>, label: 'Alertes', path: '/alerts' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen glass flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="p-8 flex justify-center items-center">
        <img src={logo} alt="Logo" className="w-32 h-auto object-contain" />
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
              location.pathname === item.path
              ? 'bg-[var(--primary)] text-white shadow-lg shadow-primary/30' 
              : 'text-[var(--text-muted)] hover:bg-slate-700/20 hover:text-[var(--text-main)]'
            }`}
          >
            {item.icon}
            <span className="ml-3 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-8 py-4 border-t border-white/5 space-y-2">
        {/* Toggle Thème */}
        <div 
          onClick={toggleTheme}
          className="flex items-center p-3 rounded-xl cursor-pointer text-[var(--text-muted)] hover:bg-slate-700/20 hover:text-[var(--text-main)] transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="ml-3 font-medium">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
        </div>

        {/* Déconnexion */}
        <div 
          onClick={handleLogout}
          className="flex items-center p-3 rounded-xl cursor-pointer text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="ml-3 font-medium">Déconnexion</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
