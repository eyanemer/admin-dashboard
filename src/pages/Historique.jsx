import React, { useState, useEffect } from 'react';
import { History, Download, Filter, Search, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react';
import { getSessions } from '../api/sessions.api';

const Historique = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await getSessions();
      setActivities(response.data.sessions || response.data);
    } catch (error) {
      console.error("Erreur sessions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historique d'activité</h1>
          <p className="text-sm text-slate-500 mt-1">Flux des entrées et sorties en temps réel.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSessions} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Place</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Heure Entrée</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-6 h-12 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : activities.length > 0 ? (
                activities.map((act) => (
                  <tr key={act._id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-black uppercase">
                          {act.user?.nom ? act.user.nom[0] : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{act.user?.prenom} {act.user?.nom}</p>
                          <p className="text-[10px] text-slate-400 tracking-tight">{act.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        {act.placeParking?.numeroPlace || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          act.statutSession === 'en cours' ? 'bg-blue-500 animate-pulse' : 
                          act.statutSession === 'payée' ? 'bg-amber-500' : 'bg-slate-300'
                        }`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          act.statutSession === 'en cours' ? 'text-blue-600' : 
                          act.statutSession === 'payée' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {act.statutSession}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-slate-500 font-mono">
                      {new Date(act.heureEntree).toLocaleString()}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-sm font-black text-slate-900">
                        {act.montantTotal ? act.montantTotal.toFixed(2) : '0.00'} <span className="text-[10px] text-slate-400">DT</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic">
                    Aucune activité stationnement trouvée dans la base.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Historique;
