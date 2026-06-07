import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsers, deleteUser, createUser, updateUser } from '../api/users.api';
import { useSearchParams } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: 'client',
    approved: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data.users || response.data);
    } catch (error) {
      console.error("Erreur de chargement des utilisateurs", error);
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null && query !== searchTerm) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchParams(value ? { search: value } : {});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await deleteUser(id);
        toast.success("Utilisateur supprimé");
        fetchUsers();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      password: '', // On ne pré-remplit pas le mot de passe pour la sécurité
      telephone: user.telephone || '',
      role: user.role || 'client',
      approved: user.approved ?? (user.role === 'admin' ? false : true)
    });
    setSelectedUserId(user._id);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // Pour la mise à jour, on n'envoie pas le mot de passe s'il est vide
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await updateUser(selectedUserId, updateData);
        toast.success("Utilisateur mis à jour !");
      } else {
        const createData = {
          ...formData,
          approved: formData.role === 'admin' ? false : true
        };
        await createUser(createData);
        toast.success("Utilisateur créé avec succès !");
      }
      
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Une erreur est survenue");
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', password: '', telephone: '', role: 'client' });
    setIsEditMode(false);
    setSelectedUserId(null);
  };

  const handleApprove = async (userId) => {
    try {
      await updateUser(userId, { approved: true });
      toast.success('Administrateur approuvé. Il pourra maintenant se connecter.');
      fetchUsers();
    } catch (error) {
      toast.error('Impossible d’approuver cet administrateur.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Administrez les comptes clients et le personnel du parking.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchUsers} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
          >
            <UserPlus size={20} />
            <span>Nouveau Utilisateur</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..." 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordonnées</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-10 py-6 h-20 bg-slate-50/10"></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shadow-inner transition-all">
                          {user.nom?.[0] || 'U'}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{user.nom} {user.prenom}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{user._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={12} className="text-slate-300" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Phone size={12} className="text-slate-300" />
                          {user.telephone || 'Non renseigné'}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                        {user.role === 'admin' && (
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            user.approved ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {user.approved ? 'Approuvé' : 'En attente'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 transition-opacity opacity-100">
                        {user.role === 'admin' && !user.approved && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                            title="Approuver l'administrateur"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-400 italic">
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEditMode ? 'Modifier l\'Utilisateur' : 'Nouveau Utilisateur'}
                </h2>
              </div>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Jean"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Dupont"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Professionnel</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="jean.dupont@email.com"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" 
                      placeholder="+216 -- --- ---"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Mot de passe {isEditMode && '(Optionnel)'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      required={!isEditMode}
                      placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "••••••••"}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rôle Système</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-black focus:ring-2 focus:ring-blue-100 appearance-none"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="client">Utilisateur Standard</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-10 active:scale-95"
              >
                <Check size={20} />
                {isEditMode ? 'Enregistrer les modifications' : 'Créer l\'Utilisateur'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
