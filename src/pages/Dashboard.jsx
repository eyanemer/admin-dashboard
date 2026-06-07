import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getGlobalStats, getOccupancyStats } from '../api/stats.api';
import { getSessions } from '../api/sessions.api';
import { getAlertes } from '../api/alertes.api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    occupiedSpots: 0,
    totalSpots: 40,
    totalRevenue: 0,
    activeSessions: 0,
    currentOccupancy: 0,
    averageTime: '2h 15m',
    rotationRate: 4.2,
    subscriptionTypes: []
  });
  const [occupancyData, setOccupancyData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const socket = useSocket();

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
        setActivities(sessionsArray.slice(0, 5));
      }

      if (occupancyRes.status === 'fulfilled' && occupancyRes.value.data?.data) {
        setOccupancyData(occupancyRes.value.data.data);
      }

      if (alertsRes.status === 'fulfilled') {
        const unreadAlerts = (alertsRes.value.data || []).filter(a => !a.estLue);
        setActiveAlerts(unreadAlerts);
      }
    } catch (error) {
      console.error("Erreur chargement données dashboard", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Fallback passif toutes les 30 secondes
    const interval = setInterval(() => fetchData(), 30000);

    if (socket) {
      const handleRealtimeUpdate = () => {
        fetchData();
      };
      
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
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('session_update');
        socket.off('parking_update');
        socket.off('stats_update');
        socket.off('alerte_new');
      }
    };
  }, [socket, fetchData]);

  const stats = [
    { 
      title: 'Clients Actifs', 
      value: statsData.totalUsers || 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      description: `${statsData.totalNormalUsers || 0} Standard / ${statsData.totalAdmins || 0} Admin`
    },
    { 
      title: 'Taux d’Occupation', 
      value: `${statsData.currentOccupancy || 0}%`, 
      icon: ParkingCircle, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      description: `${statsData.occupiedSpots || 0} occupées / ${statsData.totalSpots || 40} places`
    },
    { 
      title: 'Recettes Globales', 
      value: `${(statsData.totalRevenue || 0).toFixed(2)} DT`, 
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      description: 'Total des paiements réussis'
    },
    { 
      title: 'Sessions Actives', 
      value: statsData.activeSessions || 0, 
      icon: Activity, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      description: `Rotation moyenne : ${statsData.rotationRate || 4.2}`
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Alerte Banner si nécessaire */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-white" />
            <div>
              <p className="font-bold text-sm">Alerte Système Active ({activeAlerts.length})</p>
              <p className="text-xs text-white/90">Dernier incident : {activeAlerts[0].message}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#/alerts'} 
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Voir les alertes
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tableau de bord</h1>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-wider">Temps Réel Actif</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1 italic">Supervision centralisée et indicateurs clés de City Parking.</p>
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-inner`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                {i === 1 && statsData.currentOccupancy >= 85 && (
                  <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 px-2.5 py-1 rounded-full animate-bounce">
                    Plein
                  </span>
                )}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                {loading ? '...' : stat.value}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 border-t border-slate-100 pt-3 font-medium">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Visualizations and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Occupancy Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp size={20} className="text-blue-600" />
              Taux d'occupation de la journée (%)
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
              Mise à jour automatique
            </span>
          </div>
          <div className="h-[300px] w-full mt-4">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium italic">
                Chargement du graphique...
              </div>
            ) : occupancyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#3B82F6', fontWeight: 700, fontSize: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 600, fontSize: '11px', marginBottom: '4px' }}
                    formatter={(value) => [`${value}%`, 'Occupation']} 
                  />
                  <Area type="monotone" dataKey="occupancy" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorOccupancy)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium italic">
                Aucune donnée d'occupation disponible.
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">Activités en direct</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                <span className="text-[9px] font-black uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse"></div>
                ))
              ) : activities.length > 0 ? (
                activities.map((item) => (
                  <div key={item._id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50 bg-slate-50/20">
                    <div className={`mt-0.5 p-2 rounded-xl shadow-inner ${!item.estTerminee ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {!item.estTerminee ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {item.user?.nom || 'Visiteur'} {item.user?.prenom || ''}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {item.estTerminee ? 'Sortie' : 'Entrée'} • Place {item.placeParking?.numeroPlace || 'A1'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">Aucune activité récente.</p>
              )}
            </div>
          </div>
          
          {/* Subscription stats mini-summary */}
          {statsData.subscriptionTypes?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Abonnements actifs</p>
              <div className="grid grid-cols-3 gap-2">
                {statsData.subscriptionTypes.slice(0, 3).map((sub, i) => (
                  <div key={i} className="bg-slate-50 p-2.5 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase truncate">{sub.name}</p>
                    <p className="text-sm font-black text-slate-800 mt-1">{sub.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
