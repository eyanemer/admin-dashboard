import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Clock, 
  Calendar, 
  CreditCard, 
  Users, 
  RefreshCcw, 
  ChevronRight,
  Info,
  Edit3,
  Plus,
  X,
  Check,
  Trash2,
  PowerOff
} from 'lucide-react';
import { getTarifs, updateTarif, createTarif } from '../api/tarifs.api';
import { getAllAbonnements, deactivateAbonnement, deleteAbonnement } from '../api/abonnements.api';
import toast from 'react-hot-toast';

const Tarifs = () => {
  const [rates, setRates] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prices');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTarif, setNewTarif] = useState({ type: '', category: 'visitor', prix: '', description: '' });

  const fetchTarifs = async () => {
    setLoading(true);
    try {
      const response = await getTarifs();
      setRates(response.data);
      
      const subsResponse = await getAllAbonnements();
      setSubscribers(subsResponse.data);
    } catch (error) {
      console.error("Erreur chargement données", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarifs();
  }, []);

  const handleStartEdit = (rate) => {
    setEditingId(rate._id);
    setEditValue(rate.prix);
  };

  const handleSave = async (id) => {
    try {
      await updateTarif(id, { prix: parseFloat(editValue) });
      toast.success("Tarif mis à jour");
      setEditingId(null);
      fetchTarifs();
    } catch (error) {
      toast.error("Erreur de mise à jour");
    }
  };

  const handleAddTarif = async () => {
    try {
      await createTarif(newTarif);
      toast.success("Nouveau tarif créé");
      setShowAddModal(false);
      fetchTarifs();
    } catch (error) {
      toast.error("Erreur de création");
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Voulez-vous vraiment désactiver cet abonnement ?")) {
      try {
        await deactivateAbonnement(id);
        toast.success("Abonnement désactivé");
        fetchTarifs();
      } catch (error) {
        toast.error("Erreur lors de la désactivation");
      }
    }
  };

  const handleDeleteAbonnement = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer définitivement cet abonnement ?")) {
      try {
        await deleteAbonnement(id);
        toast.success("Abonnement supprimé");
        fetchTarifs();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const visitorRates = rates.filter(r => r.category === 'visitor');
  const subscriptionPlans = rates.filter(r => r.category === 'subscription');

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Tarifs</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Définissez les règles de prix pour l'ensemble du parking.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('prices')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'prices' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Grille Tarifaire
            </button>
            <button 
              onClick={() => setActiveTab('subscribers')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'subscribers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Abonnés
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {activeTab === 'prices' ? (
        <div className="space-y-12">
          {/* Section Visiteurs */}
          <section className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="h-px w-8 bg-slate-200"></span>
              Tarifs Visiteurs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visitorRates.map((rate) => (
                <div key={rate._id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-blue-500/10 hover:border-b-blue-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                      <Clock size={24} />
                    </div>
                    {editingId === rate._id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSave(rate._id)} className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm hover:bg-emerald-600">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleStartEdit(rate)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Edit3 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{rate.type}</h3>
                  
                  <div className="flex items-baseline gap-2">
                    {editingId === rate._id ? (
                      <input 
                        autoFocus
                        type="number" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-4xl font-black text-slate-900 bg-slate-50 border-none rounded-xl px-2 w-32 focus:ring-2 focus:ring-blue-100"
                      />
                    ) : (
                      <span className="text-4xl font-black text-slate-900 tracking-tight">{rate.prix}</span>
                    )}
                    <span className="text-lg font-bold text-slate-400">DT</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{rate.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section Abonnements */}
          <section className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="h-px w-8 bg-slate-200"></span>
              Tarifs Abonnements
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {subscriptionPlans.map((rate) => (
                <div key={rate._id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all border-l-4 border-l-indigo-500/10 hover:border-l-indigo-500">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner shrink-0">
                    <CreditCard size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{rate.type}</h3>
                      {editingId === rate._id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSave(rate._id)} className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-sm">
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleStartEdit(rate)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{rate.description}</p>
                    <div className="flex items-center gap-2">
                      {editingId === rate._id ? (
                        <input 
                          autoFocus
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-2xl font-black text-slate-900 bg-slate-50 border-none rounded-lg px-2 w-24 focus:ring-2 focus:ring-indigo-100"
                        />
                      ) : (
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{rate.prix}</span>
                      )}
                      <span className="text-sm font-bold text-slate-400 uppercase">DT / Période</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Liste des Abonnés (Simulé mais propre) */
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
              <Users size={18} className="text-blue-600" />
              Répertoire des Abonnés
            </h3>
            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{subscribers.length} Actifs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Abonné</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type d'offre</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Échéance</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscribers.length > 0 ? subscribers.map((sub, i) => (
                  <tr key={sub._id || i} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                          {sub.user?.nom ? sub.user.nom[0] : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{sub.user?.prenom} {sub.user?.nom}</p>
                          <p className="text-[10px] text-slate-400">{sub.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                        {sub.tarif?.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg ${
                        sub.statutAbonnement === 'actif' ? 'bg-emerald-500 text-white shadow-emerald-100' : 
                        sub.statutAbonnement === 'en attente' ? 'bg-amber-500 text-white shadow-amber-100' :
                        'bg-slate-400 text-white shadow-slate-100'
                      }`}>
                        {sub.statutAbonnement}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center font-mono text-xs text-slate-400">
                      {sub.dateFin ? new Date(sub.dateFin).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {sub.statutAbonnement !== 'expiré' && (
                          <button 
                            onClick={() => handleDeactivate(sub._id)}
                            title="Désactiver"
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <PowerOff size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteAbonnement(sub._id)}
                          title="Supprimer"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-10 py-10 text-center text-slate-400 italic text-sm">
                      Aucun abonné trouvé dans la base.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Nouveau Tarif</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de Tarif</label>
                <input 
                  type="text" 
                  placeholder="ex: Tarif Spécial Nuit"
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-100 font-bold"
                  onChange={(e) => setNewTarif({...newTarif, type: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-100 font-bold"
                    onChange={(e) => setNewTarif({...newTarif, category: e.target.value})}
                  >
                    <option value="visitor">Visiteur</option>
                    <option value="subscription">Abonné</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prix (DT)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-100 font-bold"
                    onChange={(e) => setNewTarif({...newTarif, prix: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  placeholder="Détails du tarif..."
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-100 font-bold h-24"
                  onChange={(e) => setNewTarif({...newTarif, description: e.target.value})}
                ></textarea>
              </div>
              <button 
                onClick={handleAddTarif}
                className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
              >
                <Save size={20} />
                Enregistrer le Tarif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tarifs;
