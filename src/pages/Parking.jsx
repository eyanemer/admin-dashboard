import React, { useState, useEffect } from 'react';
import { ParkingCircle, MapPin, RefreshCcw } from 'lucide-react';
import { getParkingStatus } from '../api/parking.api';
import toast from 'react-hot-toast';

const Parking = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParking = async () => {
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
  };

  useEffect(() => {
    fetchParking();
    const interval = setInterval(fetchParking, 15000); // Rafraîchir toutes les 15s
    return () => clearInterval(interval);
  }, []);

  const levels = [...new Set(spots.map(s => s.niveau || 'Principal'))];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Supervision en temps réel</h1>
          <p className="text-sm text-slate-500 mt-1">État actuel des places de stationnement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchParking} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {levels.map((level) => (
          <div key={level} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                {level}
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {spots.filter(s => (s.niveau || 'Principal') === level).length} Places
              </span>
            </div>
            <div className="p-6 grid grid-cols-4 sm:grid-cols-5 gap-4">
              {spots.filter(s => (s.niveau || 'Principal') === level).map(spot => (
                <div 
                  key={spot._id} 
                  className={`relative group p-3 rounded-lg border flex flex-col items-center gap-2 transition-all
                    ${spot.statut === 'occupé' 
                      ? 'bg-blue-50 border-blue-100 text-blue-600' 
                      : 'bg-white border-slate-200 text-slate-400'}`}
                >
                  <span className="text-[10px] font-bold opacity-60">{spot.numero}</span>
                  <ParkingCircle size={20} strokeWidth={2.5} />
                  <div className={`h-1.5 w-1.5 rounded-full ${spot.statut === 'occupé' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-50 border border-blue-100 rounded"></div>
          <span className="text-xs font-medium text-slate-600">Occupé</span>
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
