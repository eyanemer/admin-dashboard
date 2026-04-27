import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const data = [
  { name: 'Lun', users: 400, revenue: 2400 },
  { name: 'Mar', users: 300, revenue: 1398 },
  { name: 'Mer', users: 200, revenue: 9800 },
  { name: 'Jeu', users: 278, revenue: 3908 },
  { name: 'Ven', users: 189, revenue: 4800 },
  { name: 'Sam', users: 239, revenue: 3800 },
  { name: 'Dim', users: 349, revenue: 4300 },
];

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

const Statistiques = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analyses Détaillées</h1>
          <p className="text-sm text-slate-500 mt-1">Consultez les performances et tendances de votre parking.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
            <Calendar size={18} />
            <span>Ce mois</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Revenus par jour (DT)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Répartition des types d'abonnés</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Mensuel', value: 400 },
                    { name: 'Journalier', value: 300 },
                    { name: 'Horaire', value: 300 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {['Mensuel', 'Journalier', 'Horaire'].map((type, i) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs font-medium text-slate-600">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Taux de rotation', value: '4.2x', icon: TrendingUp },
          { title: 'Temps moyen', value: '2h 15m', icon: Clock },
          { title: 'Nouveaux clients', value: '+24', icon: Users },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-lg text-blue-600">
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{item.title}</p>
              <h4 className="text-lg font-bold text-slate-900">{item.value}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistiques;
