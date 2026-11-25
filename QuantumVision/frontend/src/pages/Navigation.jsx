import React, { useState } from 'react';
import {
  Navigation as NavIcon,
  MapPin,
  Clock,
  Milestone,
  AlertTriangle,
  ShieldCheck,
  Compass,
  ArrowRight,
  Route,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
  Layers,
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Radio
} from 'lucide-react';
import { useMap } from '../context/MapContext';
import { SRIKAKULAM_SHELTERS_DATASET, findNearbySafeShelters } from '../utils/shelterEngine';

const SRIKAKULAM_ORIGINS = [
  { name: 'Srikakulam Town Hall (Municipal Office)', lat: 18.2969, lon: 83.8968, landmark: 'City Center (Nagavali West Bank)' },
  { name: 'RIMS Govt General Hospital, Srikakulam', lat: 18.3125, lon: 83.9102, landmark: 'Medical Campus Corridor' },
  { name: 'Gara Block Emergency Point', lat: 18.2800, lon: 84.0100, landmark: 'Gara Mandal Office' },
  { name: 'Narasannapeta SDRF Relief Depot', lat: 18.4215, lon: 84.0452, landmark: 'NH-16 Junction Depot' },
  { name: 'Kalingapatnam Coastal Ward', lat: 18.3375, lon: 84.1283, landmark: 'Lighthouse Coastal Ridge' }
];

export default function Navigation() {
  const {
    origin,
    setOrigin,
    searchRadiusKm,
    setSearchRadiusKm,
    nearbyShelters,
    selectedShelter,
    selectShelter,
    activeRoute,
    alternativeRoute,
    selectedRouteType,
    switchRouteType,
    selectedAlgorithm,
    selectAlgorithm,
    isNavigating,
    startNavigation,
    stopNavigation
  } = useMap();

  const [originIndex, setOriginIndex] = useState(0);
  const [avoidFloods, setAvoidFloods] = useState(true);
  const [avoidRiskZones, setAvoidRiskZones] = useState(true);
  const [avoidBlockedRoads, setAvoidBlockedRoads] = useState(true);
  const [shelterCapacityFilter, setShelterCapacityFilter] = useState(true);
  const [manualRadius, setManualRadius] = useState(5);

  const handleOriginChange = (idx) => {
    setOriginIndex(idx);
    const chosenOrigin = SRIKAKULAM_ORIGINS[idx];
    setOrigin(chosenOrigin);
  };

  const handleRadiusChange = (radius) => {
    setManualRadius(radius);
    setSearchRadiusKm(radius);
    const discovery = findNearbySafeShelters(origin, {
      initialRadiusKm: radius,
      minResultsRequired: 1,
      avoidFloodZones: avoidFloods,
      considerCapacity: shelterCapacityFilter
    });
    if (discovery.shelters.length > 0 && (!selectedShelter || !discovery.shelters.find(s => s.id === selectedShelter.id))) {
      selectShelter(discovery.shelters[0]);
    }
  };

  return (
    <div className="flex flex-col space-y-3 font-sans text-white select-none pb-4">
      {/* 1. ORIGIN SELECTION CARD */}
      <div className="bg-[#050D1C]/95 p-3 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#19D3FF] shadow-[0_0_8px_#19D3FF] animate-pulse" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              EVACUATION ORIGIN
            </h2>
          </div>
          <span className="text-[9px] font-mono text-[#19D3FF] font-bold">
            GPS LOCKED
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-[#7B92B2] uppercase block">
            Select Starting Location:
          </label>
          <select
            value={originIndex}
            onChange={(e) => handleOriginChange(Number(e.target.value))}
            className="w-full bg-[#08152B] border border-[#143257] hover:border-[#19D3FF]/50 text-white font-mono text-[11px] p-2 rounded focus:outline-none focus:border-[#19D3FF] transition-colors cursor-pointer"
          >
            {SRIKAKULAM_ORIGINS.map((item, idx) => (
              <option key={idx} value={idx}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="bg-[#030A17] p-2 rounded border border-white/5 flex items-center justify-between text-[9.5px] font-mono mt-1">
            <span className="text-[#7B92B2]">Coordinates:</span>
            <span className="text-[#19D3FF] font-semibold">
              {origin.lat.toFixed(4)}°N, {origin.lon.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* 2. NEARBY SHELTER DISCOVERY & PROGRESSIVE RADIUS */}
      <div className="bg-[#050D1C]/95 p-3 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={15} className="text-[#32E875]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              NEARBY SAFE SHELTERS
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase bg-[#19D3FF]/15 text-[#19D3FF] border border-[#19D3FF]/30">
            {searchRadiusKm} KM RADIUS
          </span>
        </div>

        {/* Progressive Search Radius Filter */}
        <div className="flex items-center justify-between mb-2.5 text-[9px] font-mono">
          <span className="text-[#7B92B2]">Search Range:</span>
          <div className="flex space-x-1">
            {[5, 10, 15, 25].map((rad) => (
              <button
                key={rad}
                onClick={() => handleRadiusChange(rad)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  searchRadiusKm === rad
                    ? 'bg-[#19D3FF] text-black font-extrabold shadow-[0_0_8px_rgba(25,211,255,0.5)]'
                    : 'bg-[#08152B] text-slate-300 border border-white/10 hover:border-[#19D3FF]/40'
                }`}
              >
                {rad} km
              </button>
            ))}
          </div>
        </div>

        {/* Shelter List */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-0.5">
          {nearbyShelters && nearbyShelters.length > 0 ? (
            nearbyShelters.map((shelter, idx) => {
              const isSelected = selectedShelter?.id === shelter.id;
              const isRecommended = shelter.isRecommended;

              return (
                <div
                  key={shelter.id || idx}
                  onClick={() => selectShelter(shelter)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0C2444] border-[#19D3FF] shadow-[0_0_15px_rgba(25,211,255,0.25)]'
                      : 'bg-[#08152B] border-white/5 hover:border-[#19D3FF]/40 hover:bg-[#0A1A33]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 pr-1">
                      {isRecommended && (
                        <div className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-extrabold uppercase bg-[#32E875]/20 text-[#32E875] border border-[#32E875]/50 mb-1">
                          <Sparkles size={9} />
                          <span>RECOMMENDED DESTINATION</span>
                        </div>
                      )}
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {idx + 1}. {shelter.name}
                      </h4>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                      shelter.isOpen && shelter.availableCapacity > 0
                        ? 'bg-[#32E875]/15 text-[#32E875] border border-[#32E875]/30'
                        : 'bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40'
                    }`}>
                      {shelter.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  {/* Recommendation explanation note */}
                  {isRecommended && shelter.recommendationReason && (
                    <div className="bg-[#050D1C] p-1.5 rounded border border-[#32E875]/30 text-[8.5px] font-mono text-[#32E875] leading-relaxed mb-1.5">
                      {shelter.recommendationReason}
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-1 text-[9px] font-mono mt-1 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-[#7B92B2] block">Distance</span>
                      <strong className="text-white text-[10px]">{shelter.roadDistanceKm} km</strong>
                    </div>
                    <div>
                      <span className="text-[#7B92B2] block">ETA</span>
                      <strong className="text-white text-[10px]">{shelter.etaMin} min</strong>
                    </div>
                    <div>
                      <span className="text-[#7B92B2] block">Available</span>
                      <strong className="text-[#32E875] text-[10px]">{shelter.availableCapacity} beds</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8.5px] font-mono mt-1.5 pt-1 border-t border-white/5 text-[#7B92B2]">
                    <span>Risk: <strong className="text-[#32E875] font-bold">{shelter.riskLevel}</strong></span>
                    <span>Cap: {shelter.totalCapacity}</span>
                    <span className={isSelected ? 'text-[#19D3FF] font-bold' : 'text-slate-400'}>
                      {isSelected ? '✓ SELECTED' : 'CLICK TO ROUTE'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 bg-[#08152B] rounded text-center text-xs font-mono text-slate-400">
              DATA UNAVAILABLE (Searching expanded area...)
            </div>
          )}
        </div>
      </div>

      {/* 3. ALGORITHM & ALTERNATIVE ROUTE SELECTOR (Section 11) */}
      <div className="bg-[#050D1C]/95 p-3 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Route size={15} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              ROUTING ENGINE STRATEGY
            </h2>
          </div>
          <span className="text-[9px] font-mono text-[#32E875] font-bold">
            SAFE CORRIDORS
          </span>
        </div>

        <div className="space-y-2">
          {/* Primary A* Route Option */}
          <div
            onClick={() => switchRouteType('primary')}
            className={`p-2.5 rounded border transition-all cursor-pointer ${
              selectedRouteType === 'primary'
                ? 'bg-[#0A223E] border-[#19D3FF] shadow-[0_0_12px_rgba(25,211,255,0.2)]'
                : 'bg-[#08152B] border-white/5 hover:border-[#19D3FF]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio size={13} className={selectedRouteType === 'primary' ? 'text-[#19D3FF]' : 'text-slate-500'} />
                <span className="text-xs font-bold text-white font-mono">
                  PRIMARY SURVEYED-ROAD ROUTE
                </span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[7.5px] font-mono font-bold uppercase bg-[#32E875]/20 text-[#32E875] border border-[#32E875]/40">
                {activeRoute?.hazard_exposure || 'EXPOSURE UNKNOWN'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono mt-1.5 text-[#7B92B2]">
              <span>Distance: <strong className="text-white">{activeRoute?.distance_km ?? '—'} km</strong></span>
              <span>ETA: <strong className="text-white">{activeRoute?.eta_min ?? '—'} min</strong></span>
              <span>Risk: <strong className="text-white">{activeRoute?.risk_score || 'UNKNOWN'}</strong></span>
            </div>
          </div>

          {/* Alternative Dijkstra Route Option */}
          <div
            onClick={() => switchRouteType('alternative')}
            className={`p-2.5 rounded border transition-all cursor-pointer ${
              selectedRouteType === 'alternative'
                ? 'bg-[#0A223E] border-[#19D3FF] shadow-[0_0_12px_rgba(25,211,255,0.2)]'
                : 'bg-[#08152B] border-white/5 hover:border-[#19D3FF]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio size={13} className={selectedRouteType === 'alternative' ? 'text-[#19D3FF]' : 'text-slate-500'} />
                <span className="text-xs font-bold text-white font-mono">
                  ALTERNATIVE SURVEYED-ROAD ROUTE
                </span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[7.5px] font-mono font-bold uppercase bg-[#19D3FF]/15 text-[#19D3FF]">
              {alternativeRoute?.hazard_exposure || 'EXPOSURE UNKNOWN'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono mt-1.5 text-[#7B92B2]">
              <span>Distance: <strong className="text-white">{alternativeRoute?.distance_km ?? '—'} km</strong></span>
              <span>ETA: <strong className="text-white">{alternativeRoute?.eta_min ?? '—'} min</strong></span>
              <span>Risk: <strong className="text-white">{alternativeRoute?.risk_score || 'UNKNOWN'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. HAZARD AVOIDANCE CONSTRAINTS */}
      <div className="bg-[#050D1C]/95 p-3 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Sliders size={14} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              SAFETY CONSTRAINTS
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#32E875] font-bold">ALL ACTIVE</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <label className="flex items-center justify-between p-1.5 bg-[#08152B] rounded border border-white/5 cursor-pointer">
            <span className="text-slate-300 text-[10px]">Avoid Flood Inundation Zones</span>
            <input
              type="checkbox"
              checked={avoidFloods}
              onChange={(e) => setAvoidFloods(e.target.checked)}
              className="accent-[#19D3FF] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-[#08152B] rounded border border-white/5 cursor-pointer">
            <span className="text-slate-300 text-[10px]">Avoid High-Risk River Causeways</span>
            <input
              type="checkbox"
              checked={avoidRiskZones}
              onChange={(e) => setAvoidRiskZones(e.target.checked)}
              className="accent-[#19D3FF] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-[#08152B] rounded border border-white/5 cursor-pointer">
            <span className="text-slate-300 text-[10px]">Exclude Submerged / Blocked Roads</span>
            <input
              type="checkbox"
              checked={avoidBlockedRoads}
              onChange={(e) => setAvoidBlockedRoads(e.target.checked)}
              className="accent-[#19D3FF] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-[#08152B] rounded border border-white/5 cursor-pointer">
            <span className="text-slate-300 text-[10px]">Filter Full Capacity Shelters</span>
            <input
              type="checkbox"
              checked={shelterCapacityFilter}
              onChange={(e) => setShelterCapacityFilter(e.target.checked)}
              className="accent-[#19D3FF] cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
