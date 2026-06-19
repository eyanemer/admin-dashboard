import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  ParkingCircle, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  CreditCard,
  UserPlus,
  LogIn,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { getGlobalStats, getOccupancyStats } from '../api/stats.api';
import { getSessions } from '../api/sessions.api';
import { getAlertes } from '../api/alertes.api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// ── Petite carte de notification live ──────────────────────────
const LiveNotifBadge = ({ notif, onClose }) => {
  const icons = {
    register: <UserPlus size={18} className="text-emerald-500" />,
    login:    <LogIn size={18} className="text-blue-500" />,
    payment:  <CreditCard size={18} className="text-violet-500" />,
    default:  <Bell size={18} className="text-slate-400" />,
  };
  const kind = notif.title?.includes('Bienvenue') ? 'register'
             : notif.title?.includes('Connexion') ? 'login'
             : notif.title?.includes('Abonnement') ? 'payment'
             : 'default';

  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-lg animate-slide-in">
      <div className={`p-2 rounded-xl shadow-inner ${
        kind === 'register' ? 'bg-emerald-50' :
        kind === 'login'    ? 'bg-blue-50' :
        kind === 'payment'  ? 'bg-violet-50' : 'bg-slate-50'
      }`}>
        {icons[kind]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-900 truncate">{notif.title}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{notif.content}</p>
      </div>
      <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">×</button>
    </div>
  );
};

// ── Badge de statut de session ──────────────────────────────────
const SessionStatusBadge = ({ statut }) => {
  const cfg = {
    'en cours':  { color: 'bg-blue-100 text-blue-700',    label: 'En cours' },
    'payée':     { color: 'bg-violet-100 text-violet-700', label: 'Payée'   },
    'terminée':  { color: 'bg-emerald-100 text-emerald-700', label: 'Terminée' },
    'expirée':   { color: 'bg-red-100 text-red-700',      label: 'Expirée' },
  };
  const { color, label } = cfg[statut] || { color: 'bg-slate-100 text-slate-600', label: statut };
  return <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
};

const Dashboard = () => {
  const { user: adminUser } = useAuth();
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    occupiedSpots: 0,
    totalSpots: 40,
    totalRevenue: 0,
    activeSessions: 0,
    currentOccupancy: 0,
    averageTime: '—',
    rotationRate: 0,
    subscriptionTypes: []
  });
  const [occupancyData, setOccupancyData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [liveNotifs, setLiveNotifs] = useState([]);   // notifs temps réel
  const notifIdRef = useRef(0);
  const socket = useSocket();

  // ── Chargement des données ────────────────────────────────────
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [statsRes, sessionsRes, occupancyRes, alertsRes] = await Promise.allSettled([
        getGlobalStats(),
        getSessions(),
        getOccupancyStats('day'),
        getAlertes()
      ]);
      
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
        setStatsData(statsRes.value.data.data);
      }
      
      if (sessionsRes.status === 'fulfilled') {
        const rawData = sessionsRes.value.data;
        const sessionsArray = Array.isArray(rawData) ? rawData : (rawData.sessions || []);
        setActivities(sessionsArray.slice(0, 6));
      }

      if (occupancyRes.status === 'fulfilled' && occupancyRes.value.data?.data) {
        setOccupancyData(occupancyRes.value.data.data);
      }

      if (alertsRes.status === 'fulfilled') {
        const unreadAlerts = (alertsRes.value.data || []).filter(a => !a.estLue);
        setActiveAlerts(unreadAlerts);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur chargement données dashboard", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // ── Ajouter une notif live (auto-disparait après 6s) ─────────
  const pushLiveNotif = useCallback((notif) => {
    const id = ++notifIdRef.current;
    setLiveNotifs(prev => [{ id, ...notif }, ...prev].slice(0, 4));
    setTimeout(() => {
      setLiveNotifs(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  // ── Socket events ─────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);

    if (socket) {
      const handleRealtimeUpdate = () => fetchData();

      socket.on('session_update', handleRealtimeUpdate);
      socket.on('parking_update', handleRealtimeUpdate);
      socket.on('stats_update', handleRealtimeUpdate);

      socket.on('alerte_new', (newAlert) => {
        toast((t) => (
          <span className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500 animate-pulse" size={20} />
            <div>
              <p className="font-bold text-xs text-slate-800 uppercase">Nouvelle alerte ({newAlert.niveau})</p>
              <p className="text-xs text-slate-600">{newAlert.message}</p>
            </div>
          </span>
        ), { duration: 5000 });
        fetchData();
      });

      socket.on('notification_new', ({ userId, notification }) => {
        if (!notification) return;
        // L'admin ne reçoit la notif live que si elle lui est adressée
        if (adminUser && userId === adminUser.id) {
          pushLiveNotif(notification);
          fetchData();
        }
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('session_update');
        socket.off('parking_update');
        socket.off('stats_update');
        socket.off('alerte_new');
        socket.off('notification_new');
      }
    };
  }, [socket, fetchData, pushLiveNotif, adminUser]);

  // ── Cartes de stats ───────────────────────────────────────────
  const stats = [
    { 
      title: 'Clients Actifs', 
      value: statsData.totalUsers || 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-indigo-600',
      description: `${statsData.totalNormalUsers || 0} Standard · ${statsData.totalAdmins || 0} Admin`
    },
    { 
      title: "Taux d'Occupation", 
      value: `${statsData.currentOccupancy || 0}%`, 
      icon: ParkingCircle, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      gradient: 'from-orange-400 to-rose-500',
      description: `${statsData.occupiedSpots || 0} occupées / ${statsData.totalSpots || 40} places`
    },
    { 
      title: 'Recettes Globales', 
      value: `${(statsData.totalRevenue || 0).toFixed(2)} DT`, 
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-400 to-teal-500',
      description: 'Total des paiements réussis'
    },
    { 
      title: 'Sessions Actives', 
      value: statsData.activeSessions || 0, 
      icon: Activity, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-violet-600',
      description: `Temps moyen : ${statsData.averageTime || '—'}`
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* ── Alerte Banner ─────────────────────────────────────── */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm">Alerte Système Active ({activeAlerts.length})</p>
              <p className="text-xs text-white/80 mt-0.5">Dernier incident : {activeAlerts[0].message}</p>
            </div>
          </div>
          <a
            href="#/alerts"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight size={14} />
            Voir les alertes
          </a>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tableau de bord</h1>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-wider">Temps Réel</span>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock size={10} />
              Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => fetchData(true)} 
            disabled={isRefreshing}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowUpRight size={18} />
            <span>Rapport</span>
          </button>
        </div>
      </div>

      {/* ── Stats Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            {/* gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} rounded-t-2xl`} />
            <div className="flex justify-between items-start mt-1">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              {i === 1 && statsData.currentOccupancy >= 85 && (
                <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 px-2.5 py-1 rounded-full animate-bounce">
                  Plein
                </span>
              )}
              {i === 1 && statsData.currentOccupancy === 0 && (
                <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                  Libre
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">{stat.title}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1 group-hover:text-blue-700 transition-colors">
              {loading ? (
                <span className="inline-block w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
              ) : stat.value}
            </h3>
            <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-50 pt-2.5 font-medium">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts + Feed ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Graphique d'occupation */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp size={18} className="text-blue-600" />
              Occupation de la journée (%)
            </h3>
            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold">
              <Zap size={11} className="text-yellow-500" />
              Auto-refresh
            </div>
          </div>
          <div className="h-[280px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <RefreshCw size={28} className="animate-spin" />
              </div>
            ) : occupancyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '14px', border: 'none', boxShadow: '0 20px 30px rgba(0,0,0,0.2)', padding: '10px 14px' }}
                    itemStyle={{ color: '#60A5FA', fontWeight: 700, fontSize: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 600, fontSize: '11px', marginBottom: '4px' }}
                    formatter={(value) => [`${value}%`, 'Occupation']}
                  />
                  <Area type="monotone" dataKey="occupancy" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOccupancy)" dot={false} activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <ParkingCircle size={36} />
                <p className="text-xs font-medium">Aucune donnée d'occupation disponible.</p>
              </div>
            )}
          </div>
        </div>

        {/* Feed Live */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
          {/* Titre */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Activités en direct</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              <span className="text-[9px] font-black uppercase tracking-wider">Live</span>
            </div>
          </div>

          {/* Notifs temps réel (inscription / connexion / paiement) */}
          {liveNotifs.length > 0 && (
            <div className="space-y-2">
              {liveNotifs.map(n => (
                <LiveNotifBadge
                  key={n.id}
                  notif={n}
                  onClose={() => setLiveNotifs(prev => prev.filter(x => x.id !== n.id))}
                />
              ))}
            </div>
          )}

          {/* Sessions récentes */}
          <div className="space-y-2 flex-1">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))
            ) : activities.length > 0 ? (
              activities.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    item.statutSession === 'en cours' ? 'bg-blue-50 text-blue-600' :
                    item.statutSession === 'payée'    ? 'bg-violet-50 text-violet-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.statutSession === 'terminée'
                      ? <ArrowDownCircle size={15} />
                      : <ArrowUpCircle size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-900 truncate">
                      {item.user?.nom || 'Visiteur'} {item.user?.prenom || ''}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Place {item.placeParking?.numeroPlace || '—'} · {new Date(item.heureEntree).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <SessionStatusBadge statut={item.statutSession} />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-300 space-y-2">
                <CheckCircle2 size={28} className="mx-auto" />
                <p className="text-xs font-medium">Aucune activité récente.</p>
              </div>
            )}
          </div>

          {/* Résumé abonnements */}
          {statsData.subscriptionTypes?.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Abonnements</p>
              <div className="grid grid-cols-3 gap-2">
                {statsData.subscriptionTypes.filter(s => s.name !== 'Sans').slice(0, 3).map((sub, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50 p-2.5 rounded-xl text-center border border-blue-50">
                    <p className="text-[9px] font-bold text-slate-500 uppercase truncate">{sub.name}</p>
                    <p className="text-sm font-black text-slate-800 mt-1">{sub.value}</p>
                  </div>
                ))}
                {statsData.subscriptionTypes.filter(s => s.name !== 'Sans').length === 0 && (
                  <p className="col-span-3 text-center text-[10px] text-slate-400 italic">Aucun abonnement actif</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
