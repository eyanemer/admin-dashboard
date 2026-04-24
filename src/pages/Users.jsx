import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Edit2, Trash2, Eye, UserPlus, Search, Loader2, X } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/getAllUsers');
      // On récupère le tableau 'users' qui est dans l'objet de réponse
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.delete(`/users/deleteUser/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/updateUser/${currentUser._id}`, currentUser);
      setIsEditModalOpen(false);
      fetchUsers();
      alert("Utilisateur mis à jour !");
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const filteredUsers = users.filter(user => 
    (user.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (user.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={48}/>
      <p className="text-slate-500 font-medium">Chargement des utilisateurs...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 mt-1">Gérez les accès et les profils de votre plateforme.</p>
        </div>
        <button className="bg-[var(--primary)] text-white px-5 py-3 rounded-2xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold">
          <UserPlus size={20}/> Ajouter
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou email..." 
          className="w-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-2xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tableau Premium */}
      <div className="bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-widest">
                <th className="px-8 py-5">Utilisateur</th>
                <th className="px-8 py-5">Rôle</th>
                <th className="px-8 py-5">Téléphone</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                        {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">{user.nom} {user.prenom}</span>
                        <span className="text-sm text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-sm">
                    {user.telephone || 'Non renseigné'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:text-primary transition-all">
                        <Eye size={18}/>
                      </button>
                      <button 
                        onClick={() => { setCurrentUser(user); setIsEditModalOpen(true); }}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:text-amber-500 transition-all"
                      >
                        <Edit2 size={18}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale d'Édition */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/5">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Modifier le profil</h2>
                <p className="text-sm text-slate-500 mt-1">Mettez à jour les informations de {currentUser.prenom}.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nom</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-primary/50 outline-none"
                    value={currentUser.nom}
                    onChange={(e) => setCurrentUser({...currentUser, nom: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Prénom</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-primary/50 outline-none"
                    value={currentUser.prenom}
                    onChange={(e) => setCurrentUser({...currentUser, prenom: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rôle Système</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  <option value="client">Client (Utilisateur standard)</option>
                  <option value="admin">Administrateur (Contrôle total)</option>
                </select>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
