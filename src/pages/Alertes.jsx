import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Bell, Trash2, CheckCircle, Clock, Info, ShieldAlert, RefreshCw, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAlertes, markAlerteAsRead, deleteAlerte, simulateAlerte } from '../api/alertes.api';
import { useSocket } from '../context/SocketContext';

const Alertes = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const socket = useSocket();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAlertes();
      setAlerts(response.data);
    } catch (error) {
      console.error("Erreur alertes", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    
    // Fallback passif si le socket ne marche pas
    const interval = setInterval(fetchAlerts, 40000);

    if (socket) {
      socket.on('alerte_new', (newAlert) => {
        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('alerte_new');
      }
    };
  }, [socket, fetchAlerts]);

  const handleSimulateAlert = async () => {
    setSimulating(true);
    try {
      await simulateAlerte();
      toast.success("Simulation d'alerte déclenchée avec succès");
    } catch (error) {
      console.error("Erreur de simulation d'alerte", error);
      toast.error("Impossible de simuler l'alerte");
    } finally {
      setSimulating(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAlerteAsRead(id);
      toast.success("Marquée comme lue");
      fetchAlerts();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlerte(id);
      toast.success("Alerte supprimée");
      fetchAlerts();
    } catch (error) {
      toast.error("Erreur de suppression");
    }
  };

  const getAlertStyle = (level) => {
    switch (level) {
      case 'critique': return 'border-l-red-500 bg-red-50/30 text-red-700';
      case 'warning': return 'border-l-orange-500 bg-orange-50/30 text-orange-700';
      default: return 'border-l-blue-500 bg-blue-50/30 text-blue-700';
    }
  };

  const getIcon = (level) => {
    switch (level) {
      case 'critique': return ShieldAlert;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centre d'Alertes</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Surveillance des incidents et notifications système.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSimulateAlert} 
            disabled={simulating}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-100 hover:shadow-lg disabled:opacity-50 active:scale-95"
          >
            <PlusCircle size={16} />
            <span>{simulating ? 'Simulation...' : 'Simuler une alerte'}</span>
          </button>
          <button onClick={fetchAlerts} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Bell size={18} className="text-blue-600" />
            <span className="text-xs font-bold text-slate-900">{alerts.filter(a => !a.estLue).length} Nouvelles</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))
        ) : alerts.length > 0 ? (
          alerts.map((alert) => {
            const Icon = getIcon(alert.niveau);
            return (
              <div 
                key={alert._id} 
                className={`p-6 rounded-2xl border border-slate-200 border-l-4 shadow-sm transition-all flex items-center justify-between gap-6 hover:shadow-md ${getAlertStyle(alert.niveau)} ${alert.estLue ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">{alert.type.replace(/_/g, ' ')}</h3>
                    <p className="text-sm font-medium mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-bold flex items-center gap-1 opacity-70">
                        <Clock size={12} />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      {alert.placeId && (
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                          Place: {alert.placeId.numeroPlace}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!alert.estLue && (
                    <button 
                      onClick={() => handleMarkAsRead(alert._id)}
                      className="p-2 hover:bg-white rounded-lg transition-all"
                      title="Marquer comme lue"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(alert._id)}
                    className="p-2 hover:bg-white rounded-lg transition-all text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <CheckCircle className="mx-auto mb-4 text-emerald-500" size={48} />
            <h3 className="text-lg font-bold text-slate-900">Aucune alerte en cours</h3>
            <p className="text-sm text-slate-500">Le système fonctionne normalement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertes;
