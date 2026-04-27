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
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Place</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrée</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-12 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : activities.length > 0 ? (
                activities.map((act) => (
                  <tr key={act._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {act.statut === 'en cours' ? (
                          <ArrowUpCircle size={16} className="text-blue-600" />
                        ) : (
                          <ArrowDownCircle size={16} className="text-emerald-600" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${act.statut === 'en cours' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {act.statut === 'en cours' ? 'entrée' : 'terminé'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{act.placeId?.numero || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 italic">{act.statut}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                      {new Date(act.dateDebut).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500">
                      {act.dateFin ? 'Terminé' : 'En cours...'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Aucune activité enregistrée.
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
