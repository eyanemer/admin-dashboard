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
  ArrowUpCircle
} from 'lucide-react';
import { getGlobalStats } from '../api/stats.api';
import { getSessions } from '../api/sessions.api';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    occupiedSpots: 0,
    totalSpots: 40,
    totalRevenue: 0,
    activeSessions: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.allSettled([
        getGlobalStats(),
        getSessions()
      ]);
      
      if (statsRes.status === 'fulfilled') {
        setStatsData(statsRes.value.data);
      }
      
      if (sessionsRes.status === 'fulfilled') {
        const rawData = sessionsRes.value.data;
        const sessionsArray = Array.isArray(rawData) ? rawData : (rawData.sessions || []);
        setActivities(sessionsArray.slice(0, 4));
      }
    } catch (error) {
      console.error("Erreur critique dashboard", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Fallback passif
    const interval = setInterval(fetchData, 60000);

    if (socket) {
      socket.on('session_update', fetchData);
      socket.on('parking_update', fetchData);
      socket.on('stats_update', fetchData);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('session_update', fetchData);
        socket.off('parking_update', fetchData);
        socket.off('stats_update', fetchData);
      }
    };
  }, [socket, fetchData]);

  const stats = [
    { title: 'Clients Actifs', value: statsData.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Occupation', value: `${statsData.occupiedSpots || 0} / ${statsData.totalSpots || 40}`, icon: ParkingCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Recettes', value: `${(statsData.totalRevenue || 0).toFixed(2)} DT`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Sessions Actives', value: statsData.activeSessions || 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Données en temps réel de City Parking.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <ArrowUpRight size={18} />
          <span>Exporter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-8">
            <TrendingUp size={20} className="text-blue-600" />
            Occupation (24h)
          </h3>
          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4">
            {[40, 60, 45, 80, 55, 90, 70, 85, 40, 65, 75, 50].map((h, i) => (
              <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group">
                <div 
                  className="bg-blue-500 w-full rounded-t-lg transition-all duration-1000 group-hover:bg-blue-600" 
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6">Activités récentes</h3>
          <div className="space-y-6">
            {loading ? (
              <p className="text-sm text-slate-400">Chargement...</p>
            ) : activities.length > 0 ? (
              activities.map((item) => (
                <div key={item._id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`mt-1 p-2 rounded-lg ${!item.estTerminee ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {!item.estTerminee ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.user?.nom || 'Client'} {item.user?.prenom || ''}
                    </p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">
                      {item.estTerminee ? 'Sortie' : 'Entrée'} • {item.placeParking?.numeroPlace || '...'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Aucune activité récente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
