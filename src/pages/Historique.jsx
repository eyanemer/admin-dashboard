import React, { useState, useEffect } from 'react';
import { History, Download, Filter, Search, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Trash2 } from 'lucide-react';
import { getSessions, deleteSession } from '../api/sessions.api';

import toast from 'react-hot-toast';

const Historique = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSessions();
      const sessionsData = response.data.sessions || response.data || [];
      // Organiser les données par date d’entrée décroissante (décroissant)
      const sortedSessions = [...sessionsData].sort(
        (a, b) => new Date(b.heureEntree) - new Date(a.heureEntree)
      );
      setActivities(sortedSessions);
    } catch (err) {
      console.error("Erreur sessions", err);
      setError("Échec de chargement des données. Veuillez réessayer.");
      toast.error("Échec du chargement de l'historique des stationnements");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet historique ?")) {
      try {
        await deleteSession(id);
        toast.success("Historique supprimé avec succès");
        fetchSessions();
      } catch (err) {
        console.error("Erreur suppression", err);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historique des stationnements</h1>
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

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center font-medium shadow-sm flex flex-col items-center gap-3">
          <p className="text-base font-bold">{error}</p>
          <button 
            onClick={fetchSessions} 
            className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Place</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Heure Entrée</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Heure Sortie</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-10 py-6 h-12 bg-slate-50/50"></td>
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
                      <td className="px-10 py-6 text-sm text-slate-500 font-mono">
                        {act.heureSortie ? (
                          new Date(act.heureSortie).toLocaleString()
                        ) : (
                          <span className="text-slate-400 italic">En cours</span>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-black text-slate-900">
                            {act.montantTotal ? act.montantTotal.toFixed(2) : '0.00'} <span className="text-[10px] text-slate-400">DT</span>
                          </span>
                          {act.user?.subscriptionType && act.user.subscriptionType !== 'none' && (
                            <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider w-max">ABONNÉ</span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(act._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-10 py-20 text-center text-slate-400 italic">
                      Aucune donnée de stationnement n’est trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historique;
