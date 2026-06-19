import React, { useState, useEffect, useCallback } from 'react';
import { 
  Send, 
  Users, 
  History, 
  Trash2, 
  Bell,
  UserPlus,
  LogIn,
  CreditCard,
  Info,
  AlertTriangle,
  RefreshCw,
  CheckCheck,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendNotification, getSentNotifications, getMyNotifications, deleteNotification, markNotificationRead } from '../api/notifications.api';
import { getUsers } from '../api/users.api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth';

// ── Icône selon le titre de la notif ──────────────────────────
const NotifIcon = ({ title }) => {
  if (title?.includes('inscrit'))   return <UserPlus size={16} className="text-emerald-600" />;
  if (title?.includes('Connexion')) return <LogIn size={16} className="text-blue-600" />;
  if (title?.includes('Paiement') || title?.includes('Abonnement')) return <CreditCard size={16} className="text-violet-600" />;
  if (title?.includes('alerte') || title?.includes('Alerte')) return <AlertTriangle size={16} className="text-amber-600" />;
  return <Info size={16} className="text-slate-400" />;
};

const notifBg = (title) => {
  if (title?.includes('inscrit'))   return 'bg-emerald-50';
  if (title?.includes('Connexion')) return 'bg-blue-50';
  if (title?.includes('Paiement') || title?.includes('Abonnement')) return 'bg-violet-50';
  return 'bg-slate-50';
};

const Notifications = () => {
  const [sentHistory, setSentHistory] = useState([]);
  const [received, setReceived]       = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('received');
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const { user: adminUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    recipient: ''
  });

  // ── Chargement ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyRes, usersRes, myRes] = await Promise.all([
        getSentNotifications(),
        getUsers(),
        getMyNotifications()
      ]);
      setSentHistory(historyRes.data);
      setUsers(usersRes.data.users || usersRes.data);
      const myNotifs = myRes.data || [];
      setReceived(myNotifs);
      setUnreadCount(myNotifs.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Erreur notifications', error);
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket : mise à jour temps réel ──────────────────────────
  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('notification_new', ({ userId, notification }) => {
        if (!notification) return;
        // L'admin reçoit la notif si elle lui est destinée
        if (adminUser && userId === adminUser.id) {
          setReceived(prev => [notification, ...prev]);
          setUnreadCount(c => c + 1);
          toast((t) => (
            <span className="flex items-center gap-2">
              <Bell size={16} className="text-blue-500" />
              <span className="text-xs font-bold">{notification.title}</span>
            </span>
          ), { duration: 4000 });
        }
      });
    }

    return () => {
      if (socket) socket.off('notification_new');
    };
  }, [socket, fetchData, adminUser]);

  // ── Envoi ────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Veuillez remplir le titre et le contenu');
      return;
    }
    try {
      await sendNotification(formData);
      toast.success('Notification envoyée !');
      setFormData({ title: '', content: '', type: 'info', recipient: '' });
      fetchData();
      setActiveTab('sent');
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  // ── Suppression ──────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette notification ?")) {
      try {
        await deleteNotification(id);
        toast.success('Supprimée');
        fetchData();
      } catch {
        toast.error('Erreur');
      }
    }
  };

  // ── Marquer lue ─────────────────────────────────────────────
  const handleMarkRead = async (notif) => {
    if (notif.isRead) return;
    try {
      await markNotificationRead(notif._id);
      setReceived(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const tabs = [
    { id: 'received', label: 'Reçues', icon: Inbox, badge: unreadCount },
    { id: 'new',      label: 'Envoyer', icon: Send },
    { id: 'sent',     label: 'Historique', icon: History },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centre de Messagerie</h1>
          <p className="text-sm text-slate-500 mt-1 italic">
            Notifications reçues en temps réel et gestion des envois.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => fetchData()}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Onglet Reçues ──────────────────────────────────────── */}
      {activeTab === 'received' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Inbox size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Notifications reçues</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Activités automatiques — inscription, connexion, paiement</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1.5 rounded-full">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-5 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                    <div className="h-2.5 bg-slate-50 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))
            ) : received.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="mx-auto mb-3 text-slate-200" size={36} />
                <p className="text-sm font-bold text-slate-400">Aucune notification reçue</p>
                <p className="text-xs text-slate-300 mt-1">Les inscriptions, connexions et paiements apparaîtront ici</p>
              </div>
            ) : (
              received.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkRead(notif)}
                  className={`flex items-start gap-4 p-5 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${notifBg(notif.title)}`}>
                    <NotifIcon title={notif.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[12px] font-black truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.content}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                  )}
                  {notif.isRead && (
                    <CheckCheck size={14} className="text-slate-300 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Onglet Envoyer ─────────────────────────────────────── */}
      {activeTab === 'new' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Send size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Composer une Notification</h2>
            </div>
            <form onSubmit={handleSend} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinataire</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
                    <select
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 appearance-none"
                      value={formData.recipient}
                      onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
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
                    <Bell className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
                    <select
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="info">Information (Bleu)</option>
                      <option value="warning">Avertissement (Orange)</option>
                      <option value="alert">Urgence (Rouge)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre</label>
                <input
                  type="text"
                  placeholder="Ex: Maintenance du Parking"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-100"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                <textarea
                  placeholder="Écrivez votre message ici..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 h-32 resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Send size={18} />
                Diffuser la Notification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Onglet Historique ──────────────────────────────────── */}
      {activeTab === 'sent' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-slate-700 text-white rounded-xl">
              <History size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Historique des envois</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Type</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destinataire</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-300 text-sm italic">Aucun envoi</td>
                  </tr>
                ) : sentHistory.map((notif) => (
                  <tr key={notif._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-900 block">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          notif.type === 'alert'   ? 'bg-red-500 text-white' :
                          notif.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {notif.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{notif.content}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        {notif.recipient ? `${notif.recipient.nom} ${notif.recipient.prenom}` : '🌐 Tous'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDelete(notif._id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
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
