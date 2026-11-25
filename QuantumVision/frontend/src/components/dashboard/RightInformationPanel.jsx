import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  CloudRain, 
  Info, 
  ChevronRight, 
  Search,
  Droplets,
  Radio
} from 'lucide-react';
import { useMap } from '../../context/MapContext';

export default function RightInformationPanel() {
  const { setActiveNavTab, setLayers } = useMap();
  const [updateTimestamp, setUpdateTimestamp] = useState('2025-09-22 15:32:18 UTC');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUpdateTimestamp(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenRouting = () => {
    setActiveNavTab('NAVIGATION');
    setLayers((prev) => ({ 
      ...prev, 
      roads: true, 
      evacuationRoutes: true, 
      shelters: true, 
      hospitals: true 
    }));
  };

  const handleOpenRiskDetails = () => {
    setActiveNavTab('RISK ANALYSIS');
  };

  // Circular Gauge Calculations (68% capacity used)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (68 / 100) * circumference;

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. CURRENT EVENT CARD (Section 11) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-2 mb-2.5">
          <Radio size={14} className="text-[#19D3FF] animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
            CURRENT EVENT
          </h2>
        </div>

        <div className="flex items-start justify-between space-x-2.5">
          {/* Details */}
          <div className="flex-1 flex flex-col space-y-1">
            <div className="flex items-start space-x-2">
              <div className="p-1.5 rounded bg-[#0A2346] border border-[#19D3FF]/40 text-[#19D3FF] mt-0.5 shrink-0">
                <ShieldAlert size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase leading-snug">
                  Flood Monitoring &amp;<br />Inundation Response
                </h3>
              </div>
            </div>

            <div className="pt-2 space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#7B92B2]">Status:</span>
                <span className="text-[#32E875] font-bold">ACTIVE MONITORING</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7B92B2]">Data Source:</span>
                <span className="text-[#19D3FF] font-bold">SENTINEL-1</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[#7B92B2]">Last Update:</span>
                <span className="text-slate-300 font-medium">{updateTimestamp}</span>
              </div>
            </div>
          </div>

          {/* Radar / Satellite Thumbnail */}
          <div className="relative w-24 h-20 rounded border border-[#19D3FF]/40 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(25,211,255,0.2)] bg-[#07162C]">
            <img 
              src="/assets/images/flood_monitoring_thumb.jpg" 
              alt="Live Satellite Flood Monitoring" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.style.background = 'radial-gradient(circle, #0C376A 0%, #051429 100%)';
              }}
            />
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-black/80 border border-[#32E875]/80 flex items-center space-x-1 text-[7px] font-mono text-[#32E875] font-bold">
              <span className="w-1 h-1 rounded-full bg-[#32E875] animate-ping" />
              <span>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RISK SUMMARY CARD (Section 11) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <BarChart3 size={14} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              RISK SUMMARY
            </h2>
          </div>
          <button 
            onClick={handleOpenRiskDetails}
            className="text-[9px] font-mono text-[#19D3FF] hover:underline uppercase flex items-center space-x-0.5 cursor-pointer"
          >
            <span>ANALYTICS &gt;</span>
          </button>
        </div>

        <div className="space-y-1.5 text-[11px] font-mono">
          {/* Composite Risk */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#94A3B8] flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full border border-[#FF4D5E] bg-[#FF4D5E]/30" />
              <span>Composite Risk</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40">
              HIGH
            </span>
          </div>

          {/* Flood Risk */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#94A3B8] flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full border border-[#FF4D5E] bg-[#FF4D5E]" />
              <span>Flood Risk</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40">
              HIGH
            </span>
          </div>

          {/* Rainfall */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#94A3B8] flex items-center space-x-1.5">
              <CloudRain size={12} className="text-[#19D3FF]" />
              <span>Rainfall</span>
            </span>
            <span className="text-white font-bold">64 mm/hr</span>
          </div>

          {/* Flood Extent */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#94A3B8] flex items-center space-x-1.5">
              <Droplets size={12} className="text-[#19D3FF]" />
              <span>Flood Extent</span>
            </span>
            <span className="text-white font-bold">82.5 km²</span>
          </div>

          {/* Route Risk */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#94A3B8] flex items-center space-x-1.5">
              <Activity size={12} className="text-[#FFD54A]" />
              <span>Route Risk</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FFD54A]/20 text-[#FFD54A] border border-[#FFD54A]/40">
              MODERATE
            </span>
          </div>
        </div>
      </div>

      {/* 3. EVACUATION CAPACITY CARD (Section 11) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={14} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              EVACUATION CAPACITY
            </h2>
          </div>
          <span className="text-[9px] font-mono text-[#32E875] bg-[#32E875]/10 px-1.5 py-0.5 rounded border border-[#32E875]/30">
            68% LOAD
          </span>
        </div>

        <div className="flex items-center justify-between px-1 py-1">
          {/* Circular Progress Indicator */}
          <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
              <circle
                cx="34"
                cy="34"
                r={radius}
                className="text-[#0B1E38]"
                strokeWidth="5.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="34"
                cy="34"
                r={radius}
                className="text-[#19D3FF]"
                strokeWidth="5.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(25, 211, 255, 0.7))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-black font-mono text-white leading-none">
                68%
              </span>
              <span className="text-[7px] font-mono text-[#7B92B2] uppercase mt-0.5 font-bold tracking-wider">
                USED
              </span>
            </div>
          </div>

          {/* Capacity Metrics */}
          <div className="flex-1 pl-3.5 space-y-1 text-xs font-mono">
            <div className="flex justify-between items-center py-0.5 border-b border-white/5">
              <span className="text-[#94A3B8] text-[10px]">Shelters Used</span>
              <span className="text-white font-bold">11 / 16</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-white/5">
              <span className="text-[#94A3B8] text-[10px]">Evacuees</span>
              <span className="text-white font-bold">2,340</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[#94A3B8] text-[10px]">Total Capacity</span>
              <span className="text-[#19D3FF] font-bold">3,680</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. EMERGENCY ALERTS CARD (Section 11) - Scrollable */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} className="text-[#FF4D5E]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              EMERGENCY ALERTS
            </h2>
          </div>
          <span className="text-[9px] font-mono text-[#FF4D5E] font-bold">5 ACTIVE</span>
        </div>

        {/* Scrollable Alerts Container */}
        <div className="space-y-2 text-[10px] font-mono max-h-44 overflow-y-auto custom-scrollbar pr-1">
          {/* Alert 1 */}
          <div className="flex items-start justify-between space-x-2 pb-1.5 border-b border-white/5">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={11} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#FF4D5E] uppercase text-[10px]">
                  Flood Water Detected
                </span>
                <span className="text-[#8EA5C4] text-[9px] leading-tight">
                  Water extent increased in coastal region
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-[#FF4D5E] bg-[#FF4D5E]/15 border border-[#FF4D5E]/30 shrink-0">
              High
            </span>
          </div>

          {/* Alert 2 */}
          <div className="flex items-start justify-between space-x-2 pb-1.5 border-b border-white/5">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#FFD54A]/20 text-[#FFD54A] border border-[#FFD54A]/50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={11} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white uppercase text-[10px]">
                  High Water Extent
                </span>
                <span className="text-[#8EA5C4] text-[9px] leading-tight">
                  Significant inundation in low-lying areas
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-[#FFD54A] bg-[#FFD54A]/15 border border-[#FFD54A]/30 shrink-0">
              Medium
            </span>
          </div>

          {/* Alert 3 */}
          <div className="flex items-start justify-between space-x-2 pb-1.5 border-b border-white/5">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#FFD54A]/20 text-[#FFD54A] border border-[#FFD54A]/50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={11} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white uppercase text-[10px]">
                  Road Risk Detected
                </span>
                <span className="text-[#8EA5C4] text-[9px] leading-tight">
                  Multiple roads affected by flood
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-[#FFD54A] bg-[#FFD54A]/15 border border-[#FFD54A]/30 shrink-0">
              Medium
            </span>
          </div>

          {/* Alert 4 */}
          <div className="flex items-start justify-between space-x-2 pb-1.5 border-b border-white/5">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#32E875]/20 text-[#32E875] border border-[#32E875]/50 flex items-center justify-center shrink-0 mt-0.5">
                <CloudRain size={11} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white uppercase text-[10px]">
                  Heavy Rainfall
                </span>
                <span className="text-[#8EA5C4] text-[9px] leading-tight">
                  Rainfall intensity 64 mm/hr
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-[#FFD54A] bg-[#FFD54A]/15 border border-[#FFD54A]/30 shrink-0">
              Medium
            </span>
          </div>

          {/* Alert 5 */}
          <div className="flex items-start justify-between space-x-2">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#19D3FF]/20 text-[#19D3FF] border border-[#19D3FF]/50 flex items-center justify-center shrink-0 mt-0.5">
                <Info size={11} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white uppercase text-[10px]">
                  Shelter Capacity Warning
                </span>
                <span className="text-[#8EA5C4] text-[9px] leading-tight">
                  Shelter occupancy above 80%
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-[#19D3FF] bg-[#19D3FF]/15 border border-[#19D3FF]/30 shrink-0">
              Info
            </span>
          </div>
        </div>
      </div>

      {/* 5. PRIMARY ACTION BUTTON */}
      <div className="pt-0.5">
        <button
          onClick={handleOpenRouting}
          className="w-full relative overflow-hidden bg-gradient-to-r from-[#1266B5] via-[#1A7CE0] to-[#1266B5] hover:from-[#19D3FF] hover:to-[#287BFF] hover:text-black text-white font-mono text-xs font-black py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2 border border-[#19D3FF]/60 shadow-[0_0_20px_rgba(25,211,255,0.4)] cursor-pointer group"
        >
          <span className="tracking-wider uppercase">OPEN EVACUATION NAVIGATION</span>
          <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
