import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Droplets, 
  ShieldCheck, 
  Navigation,
  FileText
} from 'lucide-react';
import { useMap } from '../../context/MapContext';

export default function FloodImpactRightPanel() {
  const { setActiveNavTab } = useMap();

  const submergedRoads = [
    { name: 'SH-9 Vamsadhara Bridge Road', mandal: 'Srikakulam', waterDepth: '0.9m', status: 'CLOSED' },
    { name: 'NH-16 Low Link Causeway', mandal: 'Tekkali', waterDepth: '0.4m', status: 'WARNING' },
    { name: 'Gara Coastal Evacuation Byway', mandal: 'Gara', waterDepth: '1.2m', status: 'CLOSED' },
    { name: 'Kalingapatnam Shore Road', mandal: 'Gara', waterDepth: '0.3m', status: 'CAUTION' }
  ];

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. SUBMERGED ARTERIAL CORRIDORS (Section 16) */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={15} className="text-[#FF4D5E]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              AFFECTED ROAD PASSABILITY
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#FF4D5E] font-bold">2 CLOSED &bull; 2 CAUTION</span>
        </div>

        <div className="space-y-2">
          {submergedRoads.map((road, idx) => (
            <div
              key={idx}
              className="bg-[#08152B] p-2.5 rounded border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-[11px] truncate max-w-[190px]">
                  {road.name}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold uppercase ${
                  road.status === 'CLOSED' ? 'bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40' :
                  road.status === 'WARNING' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' :
                  'bg-[#19D3FF]/20 text-[#19D3FF] border border-[#19D3FF]/40'
                }`}>
                  {road.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-[9.5px] text-[#7B92B2]">
                <span>Mandal: <strong className="text-white">{road.mandal}</strong></span>
                <span>Depth: <strong className="text-[#FF4D5E]">{road.waterDepth}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RECOVERY & ACTIONS */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={15} className="text-[#32E875]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              DDMA RESPONSE STATUS
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#32E875]">ACTIVE</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono text-slate-300">
          <div className="flex justify-between py-0.5 border-b border-white/5">
            <span className="text-[#7B92B2] text-[10px]">SDRF Teams Deployed:</span>
            <span className="text-white font-bold">6 Battalions</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/5">
            <span className="text-[#7B92B2] text-[10px]">Rescue Boats:</span>
            <span className="text-white font-bold">28 Inflatable Zodiacs</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/5">
            <span className="text-[#7B92B2] text-[10px]">Relief Food Packets:</span>
            <span className="text-white font-bold">14,200 Dropped</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-[#7B92B2] text-[10px]">Medical Camps:</span>
            <span className="text-white font-bold">8 Mobile Units</span>
          </div>
        </div>

        <button
          onClick={() => setActiveNavTab('NAVIGATION')}
          className="w-full mt-3 bg-[#19D3FF] hover:bg-[#287BFF] text-black hover:text-white font-mono font-bold text-xs py-2 rounded transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(25,211,255,0.3)]"
        >
          <Navigation size={13} />
          <span>ROUTING AROUND FLOOD ZONES</span>
        </button>
      </div>
    </div>
  );
}
