import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Waves,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { useMap } from '../context/MapContext';

export default function DisasterSimulation() {
  const { setActiveNavTab } = useMap();
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  // Simulation Parameters (Section 17)
  const [rainfallIntensity, setRainfallIntensity] = useState(64); // mm/hr
  const [floodLevel, setFloodLevel] = useState(1.8); // +meters
  const [riverDischarge, setRiverDischarge] = useState(58000); // cusecs
  const [waterAccumulation, setWaterAccumulation] = useState(2.5); // cm/hr
  const [closedRoadsCount, setClosedRoadsCount] = useState(3);
  const [shelterLoadPercent, setShelterLoadPercent] = useState(85);

  const handleRunSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
      setHasSimulated(true);
    }, 1200);
  };

  const handleReset = () => {
    setRainfallIntensity(64);
    setFloodLevel(1.8);
    setRiverDischarge(58000);
    setWaterAccumulation(2.5);
    setClosedRoadsCount(3);
    setShelterLoadPercent(68);
    setHasSimulated(false);
  };

  // Dynamically calculate simulated state from sliders
  const simExtent = (82.5 + (rainfallIntensity - 64) * 0.45 + (floodLevel - 1.8) * 8.2).toFixed(1);
  const simPop = Math.round(142500 + (rainfallIntensity - 64) * 650 + (floodLevel - 1.8) * 16000);
  const simBlockedRoads = Math.min(12, Math.max(1, Math.round(closedRoadsCount + (rainfallIntensity > 70 ? 2 : 0) + (floodLevel > 2.5 ? 2 : 0))));
  const simAvailableShelters = Math.max(2, Math.round(16 * (1 - shelterLoadPercent / 100)));

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. SIMULATION CONTROLS (Section 17) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Sliders size={15} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              SIMULATION PARAMETERS
            </h2>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40">
            [SIMULATION]
          </span>
        </div>

        {/* Sliders */}
        <div className="space-y-2.5 text-xs font-mono">
          {/* Rainfall Intensity */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#7B92B2]">Rainfall Intensity:</span>
              <span className="text-[#19D3FF] font-bold">{rainfallIntensity} mm/hr</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={rainfallIntensity}
              onChange={(e) => setRainfallIntensity(Number(e.target.value))}
              className="w-full h-1.5 bg-[#08152B] rounded-lg appearance-none cursor-pointer accent-[#19D3FF]"
            />
          </div>

          {/* Flood Level Surge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#7B92B2]">Flood Level Surge:</span>
              <span className="text-amber-400 font-bold">+{floodLevel.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={floodLevel}
              onChange={(e) => setFloodLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-[#08152B] rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* River Discharge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#7B92B2]">River Discharge (Inflow):</span>
              <span className="text-white font-bold">{riverDischarge.toLocaleString()} cusecs</span>
            </div>
            <input
              type="range"
              min="20000"
              max="150000"
              step="5000"
              value={riverDischarge}
              onChange={(e) => setRiverDischarge(Number(e.target.value))}
              className="w-full h-1.5 bg-[#08152B] rounded-lg appearance-none cursor-pointer accent-[#19D3FF]"
            />
          </div>

          {/* Water Accumulation Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#7B92B2]">Water Accumulation Rate:</span>
              <span className="text-white font-bold">{waterAccumulation.toFixed(1)} cm/hr</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8.0"
              step="0.5"
              value={waterAccumulation}
              onChange={(e) => setWaterAccumulation(Number(e.target.value))}
              className="w-full h-1.5 bg-[#08152B] rounded-lg appearance-none cursor-pointer accent-[#19D3FF]"
            />
          </div>

          {/* Shelter Load Scenario */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#7B92B2]">Shelter Occupancy Load:</span>
              <span className="text-[#32E875] font-bold">{shelterLoadPercent}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={shelterLoadPercent}
              onChange={(e) => setShelterLoadPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-[#08152B] rounded-lg appearance-none cursor-pointer accent-[#32E875]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-white/5">
          <button
            onClick={handleRunSimulation}
            disabled={simulationRunning}
            className="col-span-2 bg-[#19D3FF] hover:bg-[#287BFF] text-black hover:text-white font-mono font-bold text-xs py-2 rounded transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(25,211,255,0.35)] cursor-pointer"
          >
            {simulationRunning ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>COMPUTING WHAT-IF...</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>RUN SIMULATION</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="bg-[#08152B] hover:bg-[#0C2444] text-[#7B92B2] hover:text-white border border-white/5 font-mono text-xs py-2 rounded transition-all flex items-center justify-center space-x-1 cursor-pointer"
            title="Reset parameters to live baseline"
          >
            <RotateCcw size={12} />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 2. CURRENT VS SIMULATED STATE (Section 17) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            CURRENT STATE VS SIMULATED STATE
          </span>
          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
            SIMULATION
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {/* Affected Area */}
          <div className="p-2 rounded bg-[#08152B] border border-white/5 flex items-center justify-between">
            <span className="text-[#7B92B2] text-[10px]">Affected Area:</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 line-through">82.5 km²</span>
              <ArrowRight size={11} className="text-[#19D3FF]" />
              <strong className="text-[#FF4D5E] text-xs font-bold">{simExtent} km²</strong>
            </div>
          </div>

          {/* Population Exposed */}
          <div className="p-2 rounded bg-[#08152B] border border-white/5 flex items-center justify-between">
            <span className="text-[#7B92B2] text-[10px]">Population Exposed:</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 line-through">142,500</span>
              <ArrowRight size={11} className="text-[#19D3FF]" />
              <strong className="text-[#FF4D5E] text-xs font-bold">{simPop.toLocaleString()}</strong>
            </div>
          </div>

          {/* Roads Blocked */}
          <div className="p-2 rounded bg-[#08152B] border border-white/5 flex items-center justify-between">
            <span className="text-[#7B92B2] text-[10px]">Roads Blocked:</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 line-through">3 Links</span>
              <ArrowRight size={11} className="text-[#19D3FF]" />
              <strong className="text-amber-400 text-xs font-bold">{simBlockedRoads} Links</strong>
            </div>
          </div>

          {/* Shelters Available */}
          <div className="p-2 rounded bg-[#08152B] border border-white/5 flex items-center justify-between">
            <span className="text-[#7B92B2] text-[10px]">Shelters Available:</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 line-through">5 Open</span>
              <ArrowRight size={11} className="text-[#19D3FF]" />
              <strong className="text-[#32E875] text-xs font-bold">{simAvailableShelters} Remaining</strong>
            </div>
          </div>
        </div>

        {/* Recommended Evacuation Route Update */}
        <div className="mt-3 pt-2.5 border-t border-white/5">
          <span className="text-[8.5px] font-mono text-[#7B92B2] uppercase block mb-1.5 font-bold">
            RECOMMENDED EVACUATION ROUTE [SIMULATION-ADAPTED]:
          </span>
          <div className="p-2 rounded bg-[#0A2242] border border-[#19D3FF]/40 flex items-center justify-between text-xs font-mono">
            <div className="flex flex-col">
              <span className="text-[#19D3FF] font-bold text-[11px]">Route B (Elevated Western Ridge)</span>
              <span className="text-[9px] text-[#7B92B2]">Diverts 4.2 km around Vamsadhara breach</span>
            </div>
            <button
              onClick={() => setActiveNavTab('NAVIGATION')}
              className="px-2 py-1 rounded bg-[#19D3FF] hover:bg-white text-black font-bold text-[9px] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>APPLY</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
