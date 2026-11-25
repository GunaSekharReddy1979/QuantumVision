import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Compass,
  Cpu,
  Droplets,
  Layers,
  MapPin,
  Shield,
  ShieldCheck,
  TrendingUp,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Route as RouteIcon,
} from 'lucide-react';
import DigitalTwinMap from '../map/DigitalTwinMap';
import { useMap } from '../context/MapContext';
import { SRIKAKULAM_SHELTERS_DATASET } from '../utils/shelterEngine';

const STUDY_AREA_ORIGINS = [
  { name: 'Srikakulam Town Hall (Municipal Office)', lat: 18.2969, lon: 83.8968, landmark: 'City Center (Nagavali West)' },
  { name: 'RIMS Govt General Hospital, Srikakulam', lat: 18.3125, lon: 83.9102, landmark: 'Medical Campus Corridor' },
  { name: 'Gara Block Emergency Point', lat: 18.2800, lon: 84.0100, landmark: 'Gara Mandal Office' },
  { name: 'Narasannapeta Relief Depot', lat: 18.4215, lon: 84.0452, landmark: 'NH-16 Junction' },
  { name: 'Kalingapatnam Coastal Ward', lat: 18.3375, lon: 84.1283, landmark: 'Lighthouse Ridge' },
];

export default function Overview() {
  const {
    origin,
    setOrigin,
    selectedShelter,
    selectShelter,
    activeRoute,
    alternativeRoute,
    selectedRouteType,
    switchRouteType,
  } = useMap() || {};

  // Interactive selected feature inspection state
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Mandal flood vulnerability data (Derived from Srikakulam elevation & river corridor model)
  const mandalVulnerability = [
    { name: 'Srikakulam Town', status: 'High Risk', score: 'Model-derived', terrain: 'Nagavali Floodplain' },
    { name: 'Tekkali Corridor', status: 'High Risk', score: 'Model-derived', terrain: 'Lowland Basin' },
    { name: 'Gara Coastal Estuary', status: 'Moderate Risk', score: 'Model-derived', terrain: 'Coastal Plain' },
    { name: 'Narasannapeta Plain', status: 'Moderate Risk', score: 'Model-derived', terrain: 'Agricultural Basin' },
    { name: 'Palasa Highland', status: 'Low Risk', score: 'Model-derived', terrain: 'Elevated Ridge' },
  ];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row p-3 gap-3 overflow-hidden bg-[#02050D]">
      
      {/* LEFT: MASTER INTERACTIVE DIGITAL TWIN MAP (~70% Width) */}
      <div className="flex-1 min-w-0 h-full rounded-lg border border-[#143257] overflow-hidden bg-[#030814] relative shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col">
        <DigitalTwinMap
          selectedFeature={selectedFeature}
          onFeatureSelect={setSelectedFeature}
        />
      </div>

      {/* RIGHT: STRUCTURED INFORMATION DASHBOARD (~30% Width, Scrollable) */}
      <aside className="w-full lg:w-[32%] min-w-[340px] max-w-[460px] flex-shrink-0 h-full flex flex-col overflow-y-auto custom-scrollbar space-y-3 pr-1 text-slate-100">
        
        {/* INTERACTIVE FEATURE INSPECTION CARD (Appears when user clicks any map feature) */}
        {selectedFeature && (
          <div className="bg-[#050D1C] p-3.5 rounded-lg border border-[#19D3FF]/60 shadow-[0_0_15px_rgba(25,211,255,0.15)] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#19D3FF] animate-ping"></span>
                <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                  {selectedFeature.title || 'Selected Map Feature'}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded transition-colors"
                title="Clear Selection"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Data Source:</span>
                <span className="text-white font-medium">{selectedFeature.source || 'Spatial Layer'}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Status:</span>
                <span className="text-[#32E875] font-medium">{selectedFeature.status || 'Model-derived'}</span>
              </div>
              {selectedFeature.severity && (
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Severity Level:</span>
                  <span className="text-[#EF4444] font-bold">{selectedFeature.severity}</span>
                </div>
              )}
              {selectedFeature.metrics?.map((m, idx) => (
                <div key={idx} className="flex justify-between text-[#94A3B8] pt-0.5 border-t border-white/5">
                  <span>{m.label}:</span>
                  <span className="text-slate-200 font-bold">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. FLOOD SITUATION SECTION */}
        <section className="bg-[#050D1C] p-3.5 rounded-lg border border-[#143257] shadow-md flex flex-col space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold text-white uppercase">
              <Droplets size={14} className="text-[#38BDF8]" />
              <span>1. Flood Situation</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0284C7]/20 border border-[#0284C7]/40 text-[#38BDF8]">
              Sentinel-1 SAR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="bg-[#030814] p-2.5 rounded border border-[#143257]/80 flex flex-col justify-between">
              <span className="text-[10px] text-[#7B92B2]">MAPPED FLOOD AREA</span>
              <div className="text-base font-bold text-white mt-1">Model-derived</div>
              <span className="text-[9.5px] text-[#94A3B8] mt-0.5">Sentinel-1 Polygons Loaded</span>
            </div>

            <div className="bg-[#030814] p-2.5 rounded border border-[#143257]/80 flex flex-col justify-between">
              <span className="text-[10px] text-[#7B92B2]">DATA FRESHNESS</span>
              <div className="text-sm font-bold text-[#32E875] mt-1">Historical Pass</div>
              <span className="text-[9.5px] text-[#94A3B8] mt-0.5">2025-09-22 / 2025-10-04</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#94A3B8] bg-[#030814] p-2 rounded border border-[#143257]/60">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Info size={12} className="text-[#19D3FF] flex-shrink-0" />
              <span>Inundation delineated via SAR VV/VH polarization backscatter analysis.</span>
            </div>
          </div>
        </section>

        {/* 2. RISK AND AFFECTED AREAS SECTION */}
        <section className="bg-[#050D1C] p-3.5 rounded-lg border border-[#143257] shadow-md flex flex-col space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold text-white uppercase">
              <TrendingUp size={14} className="text-[#19D3FF]" />
              <span>2. Risk &amp; Affected Areas</span>
            </div>
            <span className="text-[10px] font-mono text-[#7B92B2]">Srikakulam Mandals</span>
          </div>

          <div className="space-y-1.5">
            {mandalVulnerability.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-[#030814] border border-[#143257]/60 text-xs font-mono hover:border-[#19D3FF]/40 transition-colors"
              >
                <div>
                  <div className="text-white font-bold">{m.name}</div>
                  <div className="text-[10px] text-[#7B92B2]">{m.terrain}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'High Risk'
                        ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                        : m.status === 'Moderate Risk'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                        : 'bg-[#32E875]/20 text-[#32E875] border border-[#32E875]/40'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10.5px] font-mono text-[#7B92B2] italic">
            * Affected road segments calculated dynamically during evacuation pathfinding.
          </div>
        </section>

        {/* 3. EVACUATION AND SHELTERS SECTION */}
        <section className="bg-[#050D1C] p-3.5 rounded-lg border border-[#143257] shadow-md flex flex-col space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold text-white uppercase">
              <Compass size={14} className="text-[#32E875]" />
              <span>3. Evacuation &amp; Shelters</span>
            </div>
            <span className="text-[10px] font-mono text-[#32E875] font-semibold">Graph Pathfinding</span>
          </div>

          {/* Origin Selection */}
          <div className="space-y-1 font-mono text-xs">
            <label className="text-[10.5px] text-[#94A3B8] flex items-center space-x-1">
              <MapPin size={11} className="text-[#19D3FF]" />
              <span>Evacuation Staging Origin:</span>
            </label>
            <select
              value={origin?.name || STUDY_AREA_ORIGINS[0].name}
              onChange={(e) => {
                const found = STUDY_AREA_ORIGINS.find((o) => o.name === e.target.value);
                if (found && setOrigin) setOrigin(found);
              }}
              className="w-full bg-[#030814] border border-[#143257] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#19D3FF]"
            >
              {STUDY_AREA_ORIGINS.map((o, idx) => (
                <option key={idx} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Target Shelter */}
          {selectedShelter && (
            <div className="bg-[#030814] p-2.5 rounded border border-[#143257] font-mono text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#7B92B2]">SELECTED TARGET SHELTER:</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#32E875]/20 text-[#32E875] rounded font-bold">
                  {selectedShelter.status || 'OPEN'}
                </span>
              </div>
              <div className="text-white font-bold text-[12px]">{selectedShelter.name}</div>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-[#94A3B8] pt-1 border-t border-white/5">
                <span>Capacity: <strong className="text-white">{selectedShelter.totalCapacity}</strong></span>
                <span>Available: <strong className="text-[#32E875]">{selectedShelter.totalCapacity - selectedShelter.currentOccupancy} beds</strong></span>
              </div>
            </div>
          )}

          {/* Active Evacuation Route Details */}
          {activeRoute && (
            <div className="bg-[#030814] p-2.5 rounded border border-[#143257] font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] text-white font-bold">
                  {selectedRouteType === 'primary' ? `${activeRoute.algorithm || 'Primary'} Route` : `${alternativeRoute?.algorithm || 'Alternative'} Route`}
                </span>
                <span className="text-[10px] text-amber-300">{activeRoute.hazard_exposure || 'Exposure unknown'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#050D1C] p-1.5 rounded border border-[#143257]/80">
                  <div className="text-[9px] text-[#7B92B2]">DISTANCE</div>
                  <div className="text-sm font-bold text-[#19D3FF]">
                    {selectedRouteType === 'primary' ? activeRoute.distanceKm : alternativeRoute?.distanceKm ?? '—'} km
                  </div>
                </div>
                <div className="bg-[#050D1C] p-1.5 rounded border border-[#143257]/80">
                  <div className="text-[9px] text-[#7B92B2]">EST. TRAVEL TIME</div>
                  <div className="text-sm font-bold text-white">
                    {selectedRouteType === 'primary' ? activeRoute.etaMin : alternativeRoute?.etaMin ?? '—'} mins
                  </div>
                </div>
              </div>

              {/* Route Switcher Button */}
              {alternativeRoute && (
                <button
                  onClick={() => switchRouteType(selectedRouteType === 'primary' ? 'alternative' : 'primary')}
                  className="w-full py-1.5 px-2 bg-[#143257]/60 hover:bg-[#143257] border border-[#19D3FF]/40 rounded text-[10px] font-mono text-[#19D3FF] font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <RouteIcon size={12} />
                  <span>
                    SWITCH TO {selectedRouteType === 'primary' ? 'ALTERNATIVE (DIJKSTRA)' : 'PRIMARY (A*)'}
                  </span>
                </button>
              )}
            </div>
          )}
        </section>

        {/* 4. CLASSICAL AND QUANTUM MODEL STATUS SECTION */}
        <section className="bg-[#050D1C] p-3.5 rounded-lg border border-[#143257] shadow-md flex flex-col space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold text-white uppercase">
              <Cpu size={14} className="text-[#A855F7]" />
              <span>4. AI &amp; Quantum Model Status</span>
            </div>
            <span className="text-[10px] font-mono text-[#A855F7]">Evaluated</span>
          </div>

          {/* Classical ML Grid */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#7B92B2] uppercase font-bold tracking-wider">
              Classical Models (Operational):
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-[#030814] p-2 rounded border border-[#143257]/80">
                <div className="text-white font-bold">Random Forest</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">100 Trees &bull; 9 Features</div>
                <div className="text-[10px] text-[#32E875] font-semibold mt-1">Status: Ready</div>
              </div>
              <div className="bg-[#030814] p-2 rounded border border-[#143257]/80">
                <div className="text-white font-bold">XGBoost</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Gradient Boosted Trees</div>
                <div className="text-[10px] text-[#32E875] font-semibold mt-1">Status: Ready</div>
              </div>
            </div>
          </div>

          {/* Quantum ML Section */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <div className="text-[10px] font-mono text-[#A855F7] uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Quantum Models (Experimental):</span>
              <span className="text-[9px] text-[#94A3B8]">PennyLane QPU Sim</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-[#030814] p-2 rounded border border-[#A855F7]/30">
                <div className="text-white font-bold">VQC</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">4 Qubits &bull; Depth 2</div>
                <div className="text-[10px] text-[#A855F7] font-semibold mt-1">Status: Evaluated</div>
              </div>
              <div className="bg-[#030814] p-2 rounded border border-[#A855F7]/30">
                <div className="text-white font-bold">QNN</div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Quantum Neural Net</div>
                <div className="text-[10px] text-[#A855F7] font-semibold mt-1">Status: Evaluated</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#64748B] pt-1">
            Note: Routing is executed via classical graph algorithms (A* &amp; Dijkstra). Quantum models are benchmarked for non-linear risk classification.
          </div>
        </section>

      </aside>

    </div>
  );
}
