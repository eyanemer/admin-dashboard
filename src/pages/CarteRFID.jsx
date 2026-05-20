// Cache-bust: 2026-04-28 01:10
import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Trash2, Power, PowerOff, X, Check, Filter, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRFIDs, createRFID, deleteRFID, activerRFID, desactiverRFID } from '../api/rfid.api';
import { getUsers } from '../api/users.api';

const CarteRFID = () => {
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({ uid: '', user: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsRes, usersRes] = await Promise.all([
        getRFIDs(),
        getUsers()
      ]);
      setCards(cardsRes.data);
      // Filtrer pour ne garder que les clients dans la liste déroulante
      const allUsers = usersRes.data.users || usersRes.data;
      setUsers(allUsers.filter(u => u.role === 'client'));
    } catch (error) {
      console.error("Erreur chargement RFID", error);
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id, isActive) => {
    try {
      if (isActive) {
        await desactiverRFID(id);
        toast.success("Carte désactivée");
      } else {
        await activerRFID(id);
        toast.success("Carte activée");
      }
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette carte définitivement ?")) {
      try {
        await deleteRFID(id);
        toast.success("Carte supprimée");
        fetchData();
      } catch (error) {
        toast.error("Erreur de suppression");
      }
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.uid || !newCard.user) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      const response = await createRFID(newCard);
      toast.success(response.data.message || "Carte associée avec succès");
      setShowAddModal(false);
      setNewCard({ uid: '', user: '' });
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de l'association";
      toast.error(errorMsg);
    }
  };

  // Filtrage local (Recherche + Statut)
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.uid?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      `${card.user?.prenom} ${card.user?.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && card.estActive) || 
      (statusFilter === 'inactive' && !card.estActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Cartes RFID</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Contrôlez les accès physiques et liez les cartes aux abonnés.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          <span>Associer une carte</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Barre de Recherche et Filtres */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par N° carte ou abonné..." 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 h-14 text-sm focus:ring-2 focus:ring-blue-100 font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select 
                className="bg-white border border-slate-200 rounded-2xl pl-12 pr-8 h-14 text-sm font-bold focus:ring-2 focus:ring-blue-100 appearance-none min-w-[160px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Toutes les cartes</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Carte</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Abonné</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-6 h-20 bg-slate-50/10"></td>
                  </tr>
                ))
              ) : filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <tr key={card._id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-10 py-6 font-mono text-sm font-black text-slate-700 tracking-tight">
                      {card.uid}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {card.user?.prenom?.[0] || '?'}
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {card.user?.prenom} {card.user?.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg uppercase">
                        Zone {card.zone || 'A'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${
                        card.estActive ? 'bg-emerald-500 text-white shadow-emerald-100 shadow-lg' : 'bg-red-500 text-white shadow-red-100 shadow-lg'
                      }`}>
                        {card.estActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 transition-all">
                        <button 
                          onClick={() => handleToggleStatus(card._id, card.estActive)}
                          className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                            card.estActive 
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title={card.estActive ? 'Désactiver' : 'Activer'}
                        >
                          {card.estActive ? <PowerOff size={16} /> : <Power size={16} />}
                          <span>{card.estActive ? 'Désactiver' : 'Activer'}</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(card._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <CreditCard size={48} className="text-slate-100" />
                      <p className="text-sm text-slate-400 italic">Aucune carte trouvée pour cette sélection.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Association - Refined */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Associer une Carte RFID</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleAddCard} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de Carte RFID</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: RF-2024-0042"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                  value={newCard.uid}
                  onChange={(e) => setNewCard({...newCard, uid: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choisir l'Abonné</label>
                <div className="relative">
                  <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 appearance-none"
                    value={newCard.user}
                    onChange={(e) => setNewCard({...newCard, user: e.target.value})}
                  >
                    <option value="">Sélectionner un abonné...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.prenom} {u.nom} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Check size={20} />
                  Associer la Carte
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-4 font-medium italic">
                  L'utilisateur doit avoir un compte "client" actif pour être associé.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarteRFID;
