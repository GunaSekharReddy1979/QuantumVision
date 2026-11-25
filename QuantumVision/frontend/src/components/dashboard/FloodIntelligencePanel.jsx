import React, { useState } from 'react';
import { 
  Droplets, 
  Satellite, 
  Layers, 
  Activity, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Waves,
  Building,
  Users,
  Compass
} from 'lucide-react';
import { useMap } from '../../context/MapContext';

export default function FloodIntelligencePanel() {
  const { setLayers } = useMap();
  const [selectedTimeline, setSelectedTimeline] = useState('2025-09-22');

  const timelineDates = [
    { date: '2025-09-10', label: 'PRE-FLOOD BASELINE', extent: '18.2 km²', prob: '12%', status: 'NORMAL' },
    { date: '2025-09-22', label: 'PEAK INUNDATION', extent: '82.5 km²', prob: '78%', status: 'ACTIVE SPILL' },
    { date: '2025-10-04', label: 'RECESSION STAGE', extent: '38.4 km²', prob: '35%', status: 'RECEDING' }
  ];

  const activeDateData = timelineDates.find(d => d.date === selectedTimeline) || timelineDates[1];

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. SENTINEL-1 SAR OBSERVATION (Section 16) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Satellite size={15} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              SENTINEL-1 OBSERVATION
            </h2>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-[#0C2B54] text-[#19D3FF] border border-[#19D3FF]/40">
            C-BAND SAR &bull; 10M
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between items-center py-0.5 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">Sensor / Payload:</span>
            <span className="text-white font-medium">Copernicus Sentinel-1 (IW)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">Polarization:</span>
            <span className="text-white font-medium">Dual-pol (VV + VH)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">SAR Backscatter dB:</span>
            <span className="text-[#FF4D5E] font-bold">-18.4 dB (Otsu Threshold)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">Temporal Drop:</span>
            <span className="text-[#19D3FF] font-bold">-4.2 dB Specular Reflection</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-[#94A3B8] text-[10px]">Water Probability:</span>
            <span className="text-[#32E875] font-bold">78% Confidence</span>
          </div>
        </div>
      </div>

      {/* 2. OBSERVATION TIMELINE & COMPARISON (Section 16) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              OBSERVATION TIMELINE
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#7B92B2]">MULTI-PASS</span>
        </div>

        <div className="space-y-1.5 mb-2.5">
          {timelineDates.map((item) => (
            <button
              key={item.date}
              onClick={() => setSelectedTimeline(item.date)}
              className={`w-full p-2 rounded flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                selectedTimeline === item.date
                  ? 'bg-[#0B2A54] text-[#19D3FF] border-[#19D3FF] shadow-[0_0_10px_rgba(25,211,255,0.3)]'
                  : 'bg-[#08152B] text-[#7B92B2] border-white/5 hover:text-white'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-white">{item.date}</span>
                <span className="text-[8px] text-[#7B92B2] uppercase">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-white">{item.extent}</span>
                <span className={`text-[7.5px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  item.status === 'ACTIVE SPILL' ? 'bg-[#FF4D5E]/20 text-[#FF4D5E]' :
                  item.status === 'RECEDING' ? 'bg-amber-400/20 text-amber-400' :
                  'bg-[#32E875]/20 text-[#32E875]'
                }`}>
                  {item.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. AFFECTED INFRASTRUCTURE & POPULATION (Section 16) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} className="text-[#FF4D5E]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              EXPOSURE &amp; IMPACT
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#FF4D5E] font-bold">ASSESSMENT</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Affected Roads</span>
            <span className="text-sm font-bold text-white">42.8 km</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Population Exposed</span>
            <span className="text-sm font-bold text-white">142,500</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Inundation Zones</span>
            <span className="text-sm font-bold text-[#19D3FF]">19 Zones (196 Polys)</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Submerged Farmland</span>
            <span className="text-sm font-bold text-white">3,420 ha</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] font-mono">
          <span className="text-[8px] text-[#7B92B2] uppercase block font-bold">CRITICAL INFRASTRUCTURE STATUS:</span>
          <div className="flex justify-between items-center text-slate-300">
            <span>&bull; Bridges at Risk:</span>
            <span className="text-[#FF4D5E] font-bold">4 (Nagavali / Vamsadhara)</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>&bull; Submerged Culverts:</span>
            <span className="text-amber-400 font-bold">12 Drainage Outlets</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>&bull; Power Sub-stations:</span>
            <span className="text-[#32E875] font-bold">2 Bunded &amp; Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
