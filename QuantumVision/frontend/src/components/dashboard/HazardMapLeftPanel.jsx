import React, { useState } from 'react';
import { 
  Waves, 
  Droplets, 
  Sliders, 
  Activity, 
  Layers, 
  AlertTriangle,
  Compass
} from 'lucide-react';
import { useMap } from '../../context/MapContext';

export default function HazardMapLeftPanel() {
  const { layers, toggleLayer } = useMap();
  const [inundationFilter, setInundationFilter] = useState(80);

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. HYDROLOGICAL CORRIDORS */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Waves size={15} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              RIVER BASIN TELEMETRY
            </h2>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40">
            HIGH DISCHARGE
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {/* Vamsadhara Basin */}
          <div className="bg-[#08152B] p-2.5 rounded border border-white/5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-[11px]">Vamsadhara River</span>
              <span className="text-[8px] font-bold text-[#FF4D5E] bg-[#FF4D5E]/15 px-1 rounded">STAGE 3</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#7B92B2]">
              <span>Inflow at Gotta Barrage:</span>
              <strong className="text-white">58,200 cusecs</strong>
            </div>
            <div className="flex justify-between text-[10px] text-[#7B92B2]">
              <span>Current Water Level:</span>
              <strong className="text-amber-400">18.4m (+1.8m)</strong>
            </div>
          </div>

          {/* Nagavali Basin */}
          <div className="bg-[#08152B] p-2.5 rounded border border-white/5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-[11px]">Nagavali River</span>
              <span className="text-[8px] font-bold text-amber-400 bg-amber-400/15 px-1 rounded">STAGE 2</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#7B92B2]">
              <span>Inflow at Madduvalasa:</span>
              <strong className="text-white">42,500 cusecs</strong>
            </div>
            <div className="flex justify-between text-[10px] text-[#7B92B2]">
              <span>Current Water Level:</span>
              <strong className="text-[#19D3FF]">16.8m (+1.1m)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RADAR INUNDATION THRESHOLDS */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <Sliders size={14} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              RADAR FILTERING
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#19D3FF]">-18.4 dB</span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#7B92B2]">Inundation Mask Confidence:</span>
              <span className="text-white font-bold">{inundationFilter}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={inundationFilter}
              onChange={(e) => setInundationFilter(Number(e.target.value))}
              className="w-full h-1.5 bg-[#08152B] rounded-lg appearance-none cursor-pointer accent-[#19D3FF]"
            />
          </div>

          <div className="pt-2 border-t border-white/5 space-y-1 text-[10px] text-[#7B92B2]">
            <div className="flex justify-between">
              <span>Threshold Algorithm:</span>
              <strong className="text-white">Otsu Bimodal Split</strong>
            </div>
            <div className="flex justify-between">
              <span>SAR Polarization:</span>
              <strong className="text-white">VV Backscatter</strong>
            </div>
            <div className="flex justify-between">
              <span>Digital Elevation:</span>
              <strong className="text-white">Copernicus 30m</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
