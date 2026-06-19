import React, { useState, useEffect, useCallback } from 'react';
import { ParkingCircle, MapPin, RefreshCcw } from 'lucide-react';
import { getParkingStatus } from '../api/parking.api';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const Parking = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchParking = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getParkingStatus();
      setSpots(response.data);
    } catch (error) {
      console.error("Erreur de chargement du parking", error);
      toast.error("Impossible de charger l'état du parking");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParking();
    
    // Actualisation passive si le Socket est coupé
    const interval = setInterval(fetchParking, 40000);

    if (socket) {
      socket.on('parking_update', fetchParking);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('parking_update', fetchParking);
      }
    };
  }, [socket, fetchParking]);

  const zones = [...new Set(spots.map(s => s.zone || 'Inconnue'))];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supervision en Temps Réel</h1>
          <p className="text-sm text-slate-500 mt-1 italic">Visualisation dynamique basée sur les sessions actives.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchParking} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {zones.map((zone) => (
          <div key={zone} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
            <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <MapPin size={18} className="text-blue-600" />
                Zone {zone}
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {spots.filter(s => s.zone === zone).length} Places totales
              </span>
            </div>
            <div className="p-8 grid grid-cols-4 sm:grid-cols-5 gap-4">
              {spots.filter(s => s.zone === zone).map(spot => (
                <div 
                  key={spot._id} 
                  title={spot.session ? `Occupé par: ${spot.session.user?.prenom} ${spot.session.user?.nom}` : 'Place libre'}
                  className={`relative group p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-help
                    ${spot.statut === 'occupé' || spot.statut === 'occupe' || spot.statut === 'payé'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105 z-10' 
                      : (spot.statut === 'réservé' || spot.statut === 'reserve')
                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100'
                        : 'bg-white border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-400'}`}
                >
                  <span className={`text-[10px] font-black ${(spot.statut === 'occupé' || spot.statut === 'occupe' || spot.statut === 'payé' || spot.statut.includes('reserv')) ? 'text-white/80' : 'text-slate-400'}`}>
                    {spot.numeroPlace}
                  </span>
                  <ParkingCircle size={24} strokeWidth={2.5} />
                  
                  {(spot.statut === 'occupé' || spot.statut === 'occupe' || spot.statut === 'payé') && (
                    <div className="absolute -top-1 -right-1">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                    </div>
                  )}

                  {/* Tooltip simplifié pour mobile/hover */}
                  {(spot.session || spot.statut.includes('reserv') || spot.statut.includes('occup')) && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                      {spot.session?.user?.nom || (spot.statut.includes('reserv') ? 'Réservé' : 'Occupé')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-xs font-medium text-slate-600">Occupé</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-xs font-medium text-slate-600">Réservé</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-white border border-slate-200 rounded"></div>
          <span className="text-xs font-medium text-slate-600">Libre</span>
        </div>
      </div>
    </div>
  );
};

export default Parking;
