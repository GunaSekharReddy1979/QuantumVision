import React, { useState, useEffect } from 'react';
import { useMap } from '../../context/MapContext';
import { MapPin, ShieldAlert, Check } from 'lucide-react';
import { getDistricts } from '../../services/locationApi';

export default function DistrictSelector() {
  const { selectedDistrict, setSelectedDistrict, setCenter } = useMap();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await getDistricts();
        if (res?.data && Array.isArray(res.data)) {
          setDistricts(res.data);
        }
      } catch (e) {
        // Fallback default
        setDistricts([
          { id: 'srikakulam', name: 'Srikakulam (Primary Study Area)', latitude: 18.2969, longitude: 83.8968 },
          { id: 'vizianagaram', name: 'Vizianagaram', latitude: 18.1133, longitude: 83.3977 },
          { id: 'visakhapatnam', name: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185 },
          { id: 'ntr', name: 'NTR (Vijayawada)', latitude: 16.5062, longitude: 80.6480 },
          { id: 'krishna', name: 'Krishna', latitude: 16.1875, longitude: 81.1389 }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadDistricts();
  }, []);

  const handleSelect = (district) => {
    setSelectedDistrict(district.id);
    if (district.latitude && district.longitude) {
      setCenter({ lat: district.latitude, lon: district.longitude, zoom: district.id === 'srikakulam' ? 10 : 9 });
    }
  };

  return (
    <div className="bg-black/75 backdrop-blur-md p-3.5 rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] pointer-events-auto flex flex-col space-y-2.5 w-72">
      <div className="flex items-center justify-between text-cyan-400 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-white">Study Region</span>
        </div>
        <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
          PROTOTYPE
        </span>
      </div>

      <div className="flex flex-col space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          <div className="text-[11px] text-slate-400 py-2 text-center font-mono">Loading districts...</div>
        ) : (
          districts.map((d) => {
            const isSelected = selectedDistrict === d.id;
            const isPrimary = d.id === 'srikakulam';
            return (
              <button
                key={d.id}
                onClick={() => handleSelect(d)}
                className={`text-left px-3 py-2 text-xs font-mono rounded transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-100 border-l-2 border-cyan-400 shadow-[inset_0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-semibold ${isSelected ? 'text-cyan-200' : 'text-slate-300'}`}>
                    {d.name}
                  </span>
                  {isPrimary && (
                    <span className="text-[9px] text-emerald-400 flex items-center space-x-1 mt-0.5">
                      <Check size={10} /> <span>Validated S1 SAR & OSM Data</span>
                    </span>
                  )}
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]"></span>}
              </button>
            );
          })
        )}
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Active Focus:</span>
        <span className="text-cyan-300 font-bold uppercase">Srikakulam, AP</span>
      </div>
    </div>
  );
}
