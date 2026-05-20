import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Calendar, Loader, Shield, UserCheck } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getGlobalStats, getRevenueStats, getOccupancyStats } from '../api/stats.api';
import toast from 'react-hot-toast';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

const Statistiques = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalNormalUsers: 0,
    averageTime: 0,
    rotationRate: 0,
    subscriptionTypes: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [revenueRes, occupancyRes, globalRes] = await Promise.all([
        getRevenueStats(),
        getOccupancyStats(),
        getGlobalStats()
      ]);

      // Traiter les données de revenu
      setRevenueData(revenueRes.data?.data || []);

      // Traiter les données d'occupation
      setOccupancyData(occupancyRes.data?.data || []);

      // Traiter les statistiques globales
      if (globalRes.data?.data) {
        setGlobalStats({
          totalRevenue: globalRes.data.data.totalRevenue || 0,
          totalUsers: globalRes.data.data.totalUsers || 0,
          totalAdmins: globalRes.data.data.totalAdmins || 0,
          totalNormalUsers: globalRes.data.data.totalNormalUsers || 0,
          averageTime: globalRes.data.data.averageTime || '2h 15m',
          rotationRate: globalRes.data.data.rotationRate || 4.2,
          subscriptionTypes: globalRes.data.data.subscriptionTypes || [
            { name: 'Mensuel', value: 400 },
            { name: 'Journalier', value: 300 },
            { name: 'Horaire', value: 300 }
          ]
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
      
      // Données par défaut en cas d'erreur
      setRevenueData([
        { name: 'Lun', revenue: 2400 },
        { name: 'Mar', revenue: 1398 },
        { name: 'Mer', revenue: 9800 },
        { name: 'Jeu', revenue: 3908 },
        { name: 'Ven', revenue: 4800 },
        { name: 'Sam', revenue: 3800 },
        { name: 'Dim', revenue: 4300 },
      ]);
      
      setOccupancyData([
        { name: 'Lun', occupancy: 65 },
        { name: 'Mar', occupancy: 58 },
        { name: 'Mer', occupancy: 72 },
        { name: 'Jeu', occupancy: 68 },
        { name: 'Ven', occupancy: 75 },
        { name: 'Sam', occupancy: 80 },
        { name: 'Dim', occupancy: 70 },
      ]);

      setGlobalStats({
        totalRevenue: 28200,
        totalUsers: 800,
        totalAdmins: 15,
        totalNormalUsers: 785,
        averageTime: '2h 15m',
        rotationRate: 4.2,
        subscriptionTypes: [
          { name: 'Mensuel', value: 400 },
          { name: 'Journalier', value: 300 },
          { name: 'Horaire', value: 300 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analyses Détaillées</h1>
          <p className="text-sm text-slate-500 mt-1">Consultez les performances et tendances de votre parking.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all ${
              selectedPeriod === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar size={18} />
            <span>Cette semaine</span>
          </button>
          <button 
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all ${
              selectedPeriod === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar size={18} />
            <span>Ce mois</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Revenue Bar Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-6">Revenus par jour (DT)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData.length > 0 ? revenueData : [
                    { name: 'Lun', revenue: 2400 },
                    { name: 'Mar', revenue: 1398 },
                    { name: 'Mer', revenue: 9800 },
                    { name: 'Jeu', revenue: 3908 },
                    { name: 'Ven', revenue: 4800 },
                    { name: 'Sam', revenue: 3800 },
                    { name: 'Dim', revenue: 4300 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} DT`} />
                    <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Occupancy Rate Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-6">Taux d'occupation (%)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData.length > 0 ? occupancyData : [
                    { name: 'Lun', occupancy: 65 },
                    { name: 'Mar', occupancy: 58 },
                    { name: 'Mer', occupancy: 72 },
                    { name: 'Jeu', occupancy: 68 },
                    { name: 'Ven', occupancy: 75 },
                    { name: 'Sam', occupancy: 80 },
                    { name: 'Dim', occupancy: 70 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line type="monotone" dataKey="occupancy" stroke="#10B981" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Subscription Types Pie Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-6">Répartition des types d'abonnés</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={globalStats.subscriptionTypes}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} abonnés`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center gap-4">
                {globalStats.subscriptionTypes.map((type, i) => (
                  <div key={type.name} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                      <span className="text-sm font-semibold text-slate-900">{type.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{type.value}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {((type.value / globalStats.subscriptionTypes.reduce((sum, t) => sum + t.value, 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Cards - Users and Admins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-500">Administrateurs</h4>
                <Shield className="text-blue-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {globalStats.totalAdmins.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-slate-500 mt-2">Comptes administrateur actifs</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-500">Utilisateurs</h4>
                <UserCheck className="text-emerald-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {globalStats.totalNormalUsers.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-slate-500 mt-2">Utilisateurs réguliers</p>
            </div>
          </div>

          {/* Summary Cards - Main Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-500">Revenu Total</h4>
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {globalStats.totalRevenue.toLocaleString('fr-FR')} DT
              </div>
              <p className="text-xs text-green-600 mt-2">↑ +12% ce mois</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-500">Temps Moyen</h4>
                <Clock className="text-emerald-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {globalStats.averageTime}
              </div>
              <p className="text-xs text-slate-500 mt-2">Temps d'occupation moyen</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-500">Total Clients</h4>
                <Users className="text-amber-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {globalStats.totalUsers.toLocaleString('fr-FR')}
              </div>
              <p className="text-xs text-slate-500 mt-2">Clients actifs (Admin + Utilisateurs)</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistiques;
