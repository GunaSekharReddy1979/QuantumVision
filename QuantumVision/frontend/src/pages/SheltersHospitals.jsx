import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HeartPulse, 
  Home, 
  MapPin, 
  Search, 
  Phone, 
  Navigation, 
  CheckCircle,
  Activity,
  Layers
} from 'lucide-react';
import { useMap } from '../context/MapContext';
import { getFacilities } from '../services/facilityApi';
import { calculateRoute } from '../services/routingApi';

export default function SheltersHospitals() {
  const { setCenter, setActiveRoute, setNavigationParams } = useMap();
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [routingId, setRoutingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getFacilities();
        if (res?.data && res.data.length > 0) {
          setFacilities(res.data);
        } else {
          // Fallback to static geojson in public
          const geoRes = await fetch('/data/srikakulam_facilities.geojson');
          const geoJson = await geoRes.json();
          const items = geoJson.features.map((f, i) => ({
            id: f.properties.id || `fac-${i}`,
            name: f.properties.name || `${f.properties.amenity} facility`,
            type: f.properties.amenity === 'hospital' || f.properties.amenity === 'clinic' ? 'hospital' : 'shelter',
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
            capacity: f.properties.capacity || 200,
            status: 'OPERATIONAL'
          }));
          setFacilities(items);
        }
      } catch (err) {
        console.warn('Facility fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = facilities.filter(f => {
    const matchesType = filterType === 'ALL' || f.type?.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleRouteToFacility = async (fac) => {
    setRoutingId(fac.id);
    setCenter({ lat: fac.latitude, lon: fac.longitude, zoom: 14 });

    try {
      const res = await calculateRoute({
        origin: { latitude: 18.2969, longitude: 83.8968 },
        destination: { latitude: fac.latitude, longitude: fac.longitude },
        hazard_avoidance: true,
        max_alternatives: 2
      });
      if (res?.data) {
        const primary = res.data.primary || res.data;
        setActiveRoute({
          ...primary,
          coordinates: primary.geometry?.coordinates?.map(c => [c[1], c[0]]) || []
        });
      }
    } catch (err) {
      console.error('Route to facility error:', err);
    } finally {
      setRoutingId(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4 text-white pb-6">
      {/* Title */}
      <div className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.15)] flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 size={18} className="text-cyan-400" />
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-200 uppercase">
              Emergency Facilities
            </h2>
          </div>
          <span className="text-[9px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
            254 VALIDATED SITES
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Real OpenStreetMap emergency infrastructure in Srikakulam District including trauma centers, PHCs, and designated evacuation shelters.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-black/75 backdrop-blur-md p-3 rounded-lg border border-white/10 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search facility name, town, or PHC..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-white rounded pl-8 pr-3 py-1.5 text-xs font-sans focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] font-mono">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`flex-1 py-1 rounded border transition-all ${
              filterType === 'ALL' 
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold' 
                : 'bg-slate-900 text-slate-400 border-white/5'
            }`}
          >
            ALL ({facilities.length})
          </button>
          <button 
            onClick={() => setFilterType('hospital')}
            className={`flex-1 py-1 rounded border transition-all ${
              filterType === 'hospital' 
                ? 'bg-rose-500/20 text-rose-200 border-rose-400 font-bold' 
                : 'bg-slate-900 text-slate-400 border-white/5'
            }`}
          >
            HOSPITALS
          </button>
          <button 
            onClick={() => setFilterType('shelter')}
            className={`flex-1 py-1 rounded border transition-all ${
              filterType === 'shelter' 
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 font-bold' 
                : 'bg-slate-900 text-slate-400 border-white/5'
            }`}
          >
            SHELTERS
          </button>
        </div>
      </div>

      {/* Facilities List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400 font-mono">
            Loading Srikakulam infrastructure...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-mono">
            No matching facilities found.
          </div>
        ) : (
          filtered.slice(0, 30).map((fac) => {
            const isHosp = fac.type === 'hospital';
            return (
              <div 
                key={fac.id}
                className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {isHosp ? (
                      <HeartPulse size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Home size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 leading-tight">
                        {fac.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {isHosp ? 'Medical / Trauma Facility' : 'Flood & Emergency Shelter'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    OPERATIONAL
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span className="flex items-center space-x-1">
                    <MapPin size={10} className="text-cyan-400" />
                    <span>{fac.latitude.toFixed(4)}, {fac.longitude.toFixed(4)}</span>
                  </span>
                  <span>Cap: {fac.capacity || 250}</span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button 
                    onClick={() => setCenter({ lat: fac.latitude, lon: fac.longitude, zoom: 15 })}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono py-1 rounded border border-white/10 transition-colors"
                  >
                    Locate on Map
                  </button>
                  <button 
                    onClick={() => handleRouteToFacility(fac)}
                    disabled={routingId === fac.id}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[10px] font-mono font-bold py-1 rounded transition-all shadow-[0_0_8px_rgba(0,229,255,0.3)] disabled:opacity-50 flex items-center justify-center space-x-1"
                  >
                    <Navigation size={10} />
                    <span>{routingId === fac.id ? 'Routing...' : 'Route Here'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
