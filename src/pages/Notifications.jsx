import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  History, 
  Trash2, 
  Info, 
  AlertTriangle, 
  Bell,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendNotification, getSentNotifications, deleteNotification } from '../api/notifications.api';
import { getUsers } from '../api/users.api';

const Notifications = () => {
  const [sentHistory, setSentHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    recipient: '' // vide = Tous
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, usersRes] = await Promise.all([
        getSentNotifications(),
        getUsers()
      ]);
      setSentHistory(historyRes.data);
      setUsers(usersRes.data.users || usersRes.data);
    } catch (error) {
      console.error("Erreur notifications", error);
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Veuillez remplir le titre et le contenu");
      return;
    }
    
    try {
      await sendNotification(formData);
      toast.success("Notification envoyée !");
      setFormData({ title: '', content: '', type: 'info', recipient: '' });
      fetchData();
      setActiveTab('history');
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette notification de l'historique ?")) {
      try {
        await deleteNotification(id);
        toast.success("Supprimée");
        fetchData();
      } catch (error) {
        toast.error("Erreur");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centre de Messagerie</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Envoyez des notifications directes aux utilisateurs de l'app mobile.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Nouveau Message
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Historique Envois
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Send size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Composer une Notification</h2>
            </div>
            
            <form onSubmit={handleSend} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinataire</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-black focus:ring-2 focus:ring-blue-100 appearance-none"
                      value={formData.recipient}
                      onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                    >
                      <option value="">Tous les utilisateurs (Broadcast)</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.nom} {u.prenom}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de Message</label>
                  <div className="relative">
                    <Bell className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-black focus:ring-2 focus:ring-blue-100 appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="info">Information (Bleu)</option>
                      <option value="warning">Avertissement (Orange)</option>
                      <option value="alert">Urgence (Rouge)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre de la Notification</label>
                <input 
                  type="text" 
                  placeholder="Ex: Maintenance du Parking"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  placeholder="Écrivez votre message ici..."
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 h-32"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-6 active:scale-95"
              >
                <Send size={20} />
                Diffuser la Notification
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
              <History size={18} className="text-blue-600" />
              Derniers Envois
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Type</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destinataire</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sentHistory.map((notif) => (
                  <tr key={notif._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-900 block">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          notif.type === 'alert' ? 'bg-red-500 text-white' : 
                          notif.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {notif.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{notif.content}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        {notif.recipient ? `${notif.recipient.nom} ${notif.recipient.prenom}` : '🌐 Tous'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(notif._id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
