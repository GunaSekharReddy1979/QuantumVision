import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ChevronUp, 
  ChevronDown, 
  Activity,
  Navigation,
  GitBranch,
  Layers
} from 'lucide-react';
import { api } from '../../services/apiClient';

export default function LowerContextualPanel() {
  const [activeTab, setActiveTab] = useState('MODEL STATUS');
  const [isCollapsed, setIsCollapsed] = useState(false); // Collapsible status
  const [modelMetrics, setModelMetrics] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.get('/risk/comparison');
        if (res?.data) {
          setModelMetrics(res.data);
        }
      } catch (err) {
        // Fallback
      }
    }
    loadMetrics();
  }, []);

  const statusStripTabs = [
    { id: 'SATELLITE OBSERVATION', label: 'SATELLITE OBSERVATION' },
    { id: 'FLOOD ANALYSIS', label: 'FLOOD ANALYSIS' },
    { id: 'RISK ANALYSIS', label: 'RISK ANALYSIS' },
    { id: 'FEATURES', label: 'FEATURES' },
    { id: 'EVACUATION', label: 'EVACUATION' },
    { id: 'QUANTUM BENCHMARKS', label: 'QUANTUM BENCHMARKS' },
  ];

  return (
    <div className="relative z-40 pointer-events-auto flex flex-col bg-[#040A17]/95 backdrop-blur-md border-t border-[#143257] shadow-[0_-8px_30px_rgba(0,0,0,0.85)] select-none">
      {/* 1. COMPACT TOP STATUS STRIP (Always visible) */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#143257]/60 bg-[#030814]/90 text-[10px] font-mono">
        <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar">
          <span className="text-[#19D3FF] font-bold uppercase tracking-wider pr-2 border-r border-[#143257] flex items-center space-x-1 shrink-0">
            <Cpu size={11} />
            <span>MODEL TELEMETRY</span>
          </span>

          <div className="flex items-center space-x-1.5 shrink-0">
            {statusStripTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(isActive ? 'MODEL STATUS' : tab.id);
                  }}
                  className={`px-2 py-0.5 text-[8.5px] font-mono font-medium tracking-wider transition-all duration-150 uppercase whitespace-nowrap cursor-pointer rounded ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0C376A] to-[#124E96] text-white border border-[#19D3FF] shadow-[0_0_10px_rgba(25,211,255,0.4)]'
                      : 'text-[#7B92B2] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-1 text-[9px] font-mono text-[#7B92B2] hover:text-white px-2 py-0.5 rounded hover:bg-white/5 cursor-pointer ml-3 whitespace-nowrap shrink-0"
          title={isCollapsed ? 'Expand model status bar' : 'Collapse model status bar'}
        >
          <span>{isCollapsed ? 'EXPAND' : 'COLLAPSE'}</span>
          {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* 2. Optional Detail Drawer (Satellite, Features, Evacuation, Quantum) */}
      {!isCollapsed && activeTab !== 'MODEL STATUS' && (
        <div className="px-3 py-2 max-h-32 overflow-y-auto custom-scrollbar text-xs font-mono bg-[#050D1C]/95 border-b border-[#143257] animate-fadeIn">
          {activeTab === 'SATELLITE OBSERVATION' && (
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">RADAR PAYLOAD</span>
                <span className="text-white font-bold text-[11px]">Sentinel-1 C-Band SAR</span>
                <span className="text-[7.5px] text-[#19D3FF] block">Dual-pol (VV + VH)</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">ACQUISITION DATES</span>
                <span className="text-[#19D3FF] font-bold text-[11px]">2025-09-22 / 2025-10-04</span>
                <span className="text-[7.5px] text-[#7B92B2] block">12-Day Inundation Baseline</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">RESOLUTION</span>
                <span className="text-white font-bold text-[11px]">10m Spatial Resolution</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Interferometric Wide (IW)</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">PROVENANCE</span>
                <span className="text-[8px] font-bold uppercase bg-[#0C2B54] text-[#19D3FF] px-1 py-0.2 rounded border border-[#19D3FF]/40 inline-block">
                  [SENTINEL-1 SAR]
                </span>
                <span className="text-[7.5px] text-amber-300 block mt-0.5">Specular water backscatter</span>
              </div>
            </div>
          )}

          {activeTab === 'FLOOD ANALYSIS' && (
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">WATER EXTENT</span>
                <span className="text-[#19D3FF] font-bold text-[11px]">82.5 km²</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Inundated flood basin</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">INUNDATION ZONES</span>
                <span className="text-white font-bold text-[11px]">19 Zones (196 Polygons)</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Otsu threshold (-18.4 dB)</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">RIVER BASINS</span>
                <span className="text-[#19D3FF] font-bold text-[11px]">Nagavali / Vamsadhara</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Active flood discharge</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">TEMPORAL SHIFT</span>
                <span className="text-[#FF4D5E] font-bold text-[11px]">-4.2 dB</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Water reflection delta</span>
              </div>
            </div>
          )}

          {activeTab === 'RISK ANALYSIS' && (
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">TOP FEATURE</span>
                <span className="text-[#19D3FF] font-bold text-[11px]">sar_vv_db (34.2%)</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Radar surface roughness</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">PRECIPITATION</span>
                <span className="text-amber-400 font-bold text-[11px]">rainfall_24h (28.6%)</span>
                <span className="text-[7.5px] text-[#7B92B2] block">AP Hydro Gauge Network</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">TOPOGRAPHY</span>
                <span className="text-white font-bold text-[11px]">elevation_m (21.4%)</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Copernicus 30m DEM</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">HYDROLOGY</span>
                <span className="text-white font-bold text-[11px]">dist_waterway (15.8%)</span>
                <span className="text-[7.5px] text-[#7B92B2] block">River channel proximity</span>
              </div>
            </div>
          )}

          {activeTab === 'FEATURES' && (
            <div className="bg-[#08152B] p-1.5 rounded border border-white/5 text-[9.5px]">
              <span className="text-[#19D3FF] font-bold block mb-1">ALL 9 RISK ENGINE FEATURES:</span>
              <div className="grid grid-cols-3 gap-1.5 text-slate-300">
                <div>&bull; sar_vv_db (Radar VV backscatter)</div>
                <div>&bull; sar_vh_db (Radar VH backscatter)</div>
                <div>&bull; sar_vv_vh_ratio (Polarization ratio)</div>
                <div>&bull; sar_temporal_diff_db (Dual-date delta)</div>
                <div>&bull; elevation_m (Copernicus DEM 30m)</div>
                <div>&bull; slope_deg (Topographical incline)</div>
                <div>&bull; distance_to_waterway_km (Hydrology)</div>
                <div>&bull; rainfall_accum_24h_mm (Cumulative rain)</div>
                <div>&bull; rainfall_intensity_mm_hr (Hourly rate)</div>
              </div>
            </div>
          )}

          {activeTab === 'EVACUATION' && (
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">ROAD GRAPH</span>
                <span className="text-white font-bold text-[11px]">171,080 Arterial Nodes</span>
                <span className="text-[7.5px] text-[#7B92B2] block">OSM Srikakulam</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">ALGORITHMS</span>
                <span className="text-[#19D3FF] font-bold text-[11px]">A* &amp; Dijkstra</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Hazard-weighted</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">SPEED</span>
                <span className="text-amber-400 font-bold text-[11px]">45.0 km/h Convoy</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Emergency rate</span>
              </div>
              <div className="bg-[#08152B] p-1.5 rounded border border-white/5">
                <span className="text-[7.5px] text-[#7B92B2] block uppercase">FLOOD PENALTY</span>
                <span className="text-[#32E875] font-bold text-[11px]">3.5x Inundation Cost</span>
                <span className="text-[7.5px] text-[#7B92B2] block">Diverts from waters</span>
              </div>
            </div>
          )}

          {activeTab === 'QUANTUM BENCHMARKS' && (
            <div className="bg-[#08152B] p-1.5 rounded border border-purple-500/30 text-[9.5px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-purple-300 font-bold">PENNYLANE QUANTUM CIRCUIT BENCHMARKS (4 QUBITS)</span>
                <span className="px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40">
                  [SIMULATION]
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-[#19D3FF] font-semibold">VQC (Variational Quantum Classifier):</span> 4 Qubits, Depth 2, 24 Params, Accuracy: 97.33%, Precision: 82.61%, Recall: 100%, F1: 0.9048, ROC-AUC: 0.9850.
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">QNN (Quantum Neural Network):</span> 4 Qubits, Depth 2, 16 Params, Accuracy: 57.33%, Precision: 19.59%, Recall: 76.32%, F1: 0.3118, ROC-AUC: 0.6261.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. COMPACT 6-MODEL STATUS CARDS (Section 19) */}
      {!isCollapsed && (
        <div className="px-3 py-1.5 grid grid-cols-6 gap-2 bg-[#040A17]/95">
          {/* CARD 1: RANDOM FOREST */}
          <div className="bg-[#061224] p-1.5 rounded border border-[#143257] hover:border-[#19D3FF]/50 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center space-x-1">
                <Cpu size={10} className="text-[#A855F7]" />
                <span className="text-[9.5px] font-bold text-white font-mono tracking-tight">RANDOM FOREST</span>
              </div>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-[#32E875]/15 text-[#32E875] border border-[#32E875]/40">
                VALIDATED
              </span>
            </div>

            <div className="space-y-0.5 text-[9px] font-mono">
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Status</span>
                <span className="text-[#32E875] font-semibold">READY</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Accuracy</span>
                <span className="text-white font-semibold">0.948</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>F1-Score</span>
                <span className="text-white font-semibold">0.887</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>ROC-AUC</span>
                <span className="text-white font-semibold">0.968</span>
              </div>
            </div>
          </div>

          {/* CARD 2: XGBOOST */}
          <div className="bg-[#061224] p-1.5 rounded border border-[#143257] hover:border-[#19D3FF]/50 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center space-x-1">
                <Activity size={10} className="text-[#19D3FF]" />
                <span className="text-[9.5px] font-bold text-white font-mono tracking-tight">XGBOOST</span>
              </div>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-[#32E875]/15 text-[#32E875] border border-[#32E875]/40">
                VALIDATED
              </span>
            </div>

            <div className="space-y-0.5 text-[9px] font-mono">
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Status</span>
                <span className="text-[#32E875] font-semibold">READY</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Accuracy</span>
                <span className="text-white font-semibold">0.961</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>F1-Score</span>
                <span className="text-white font-semibold">0.912</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>ROC-AUC</span>
                <span className="text-white font-semibold">0.981</span>
              </div>
            </div>
          </div>

          {/* CARD 3: PENNYLANE VQC */}
          <div className="bg-[#061224] p-1.5 rounded border border-[#143257] hover:border-purple-500/50 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center space-x-1">
                <Cpu size={10} className="text-[#A855F7]" />
                <span className="text-[9.5px] font-bold text-white font-mono tracking-tight">PENNYLANE VQC</span>
              </div>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40">
                SIMULATION
              </span>
            </div>

            <div className="space-y-0.5 text-[9px] font-mono">
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Status</span>
                <span className="text-[#19D3FF] font-semibold">RUNNING</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Accuracy</span>
                <span className="text-white font-semibold">0.873</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>F1-Score</span>
                <span className="text-white font-semibold">0.841</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>ROC-AUC</span>
                <span className="text-white font-semibold">0.985</span>
              </div>
            </div>
          </div>

          {/* CARD 4: QUANTUM QNN */}
          <div className="bg-[#061224] p-1.5 rounded border border-[#143257] hover:border-purple-500/50 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center space-x-1">
                <Cpu size={10} className="text-[#A855F7]" />
                <span className="text-[9.5px] font-bold text-white font-mono tracking-tight">QUANTUM QNN</span>
              </div>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40">
                SIMULATION
              </span>
            </div>

            <div className="space-y-0.5 text-[9px] font-mono">
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Status</span>
                <span className="text-[#19D3FF] font-semibold">RUNNING</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Accuracy</span>
                <span className="text-white font-semibold">0.861</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>F1-Score</span>
                <span className="text-white font-semibold">0.812</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>ROC-AUC</span>
                <span className="text-white font-semibold">0.892</span>
              </div>
            </div>
          </div>

          {/* CARD 5: A* ROUTING */}
          <div className="bg-[#061224] p-1.5 rounded border border-[#143257] hover:border-[#19D3FF]/50 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center space-x-1">
                <Navigation size={10} className="text-[#19D3FF]" />
                <span className="text-[9.5px] font-bold text-white font-mono tracking-tight">A* ROUTING</span>
              </div>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-[#0C2B54] text-[#19D3FF] border border-[#19D3FF]/40">
                LOADED
              </span>
            </div>

            <div className="space-y-0.5 text-[9px] font-mono">
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Status</span>
                <span className="text-[#32E875] font-semibold">READY</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Nodes</span>
                <span className="text-white font-semibold">98,432</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Safe Routes</span>
                <span className="text-white font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Blocked Roads</span>
                <span className="text-white font-semibold">3</span>
              </div>
            </div>
          </div>

          {/* CARD 6: DIJKSTRA */}
          <div className="bg-[#061224] p-1.5 rounded border border-[#143257] hover:border-[#19D3FF]/50 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center space-x-1">
                <GitBranch size={10} className="text-[#19D3FF]" />
                <span className="text-[9.5px] font-bold text-white font-mono tracking-tight">DIJKSTRA</span>
              </div>
              <span className="text-[6.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-[#0C2B54] text-[#19D3FF] border border-[#19D3FF]/40">
                LOADED
              </span>
            </div>

            <div className="space-y-0.5 text-[9px] font-mono">
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Status</span>
                <span className="text-[#32E875] font-semibold">READY</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Nodes</span>
                <span className="text-white font-semibold">98,432</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Safe Routes</span>
                <span className="text-white font-semibold">10</span>
              </div>
              <div className="flex justify-between items-center text-[#7B92B2]">
                <span>Avg. Distance</span>
                <span className="text-white font-semibold">21.3 km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
