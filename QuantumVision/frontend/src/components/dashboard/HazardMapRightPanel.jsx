import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Droplets, 
  Layers, 
  Navigation,
  ChevronRight
} from 'lucide-react';
import { useMap } from '../../context/MapContext';

export default function HazardMapRightPanel() {
  const { setActiveNavTab } = useMap();

  const mandalVulnerability = [
    { name: 'Tekkali', basin: 'Vamsadhara Confluence', area: '24.2 km²', risk: 'CRITICAL', color: 'text-[#FF4D5E]' },
    { name: 'Srikakulam Town', basin: 'Nagavali River Floodplain', area: '18.5 km²', risk: 'HIGH', color: 'text-[#FF4D5E]' },
    { name: 'Gara', basin: 'Coastal Inundation Surge', area: '12.8 km²', risk: 'HIGH', color: 'text-[#FF4D5E]' },
    { name: 'Palasa', basin: 'Drainage Low-lying', area: '11.4 km²', risk: 'MODERATE', color: 'text-amber-400' },
    { name: 'Narasannapeta', basin: 'Hydrological Buffer', area: '9.2 km²', risk: 'MODERATE', color: 'text-amber-400' },
    { name: 'Sompeta', basin: 'Coastal Plain', area: '6.4 km²', risk: 'LOW', color: 'text-[#19D3FF]' }
  ];

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. MANDAL VULNERABILITY CATCHMENTS */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={15} className="text-[#FF4D5E]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              CATCHMENT VULNERABILITY
            </h2>
          </div>
          <span className="text-[8.5px] font-mono text-[#FF4D5E] font-bold">6 MANDALS</span>
        </div>

        <div className="space-y-2">
          {mandalVulnerability.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#08152B] p-2.5 rounded border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-[11px]">{item.name}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  item.risk === 'CRITICAL' ? 'bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40' :
                  item.risk === 'HIGH' ? 'bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40' :
                  item.risk === 'MODERATE' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' :
                  'bg-[#19D3FF]/20 text-[#19D3FF] border border-[#19D3FF]/40'
                }`}>
                  {item.risk}
                </span>
              </div>

              <div className="flex justify-between items-center text-[9.5px] text-[#7B92B2]">
                <span>{item.basin}</span>
                <strong className="text-white">{item.area}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SUBMERGED LAND COVER BREAKDOWN */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            SUBMERGED LAND CLASSIFICATION
          </span>
          <span className="text-[8.5px] font-mono text-[#19D3FF]">82.5 km²</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between items-center py-1 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">&bull; Agricultural Paddy Fields:</span>
            <strong className="text-white">54.2 km² (65.7%)</strong>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">&bull; River Banks &amp; Floodplains:</span>
            <strong className="text-white">18.6 km² (22.5%)</strong>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/5">
            <span className="text-[#94A3B8] text-[10px]">&bull; Rural Settlement Margins:</span>
            <strong className="text-[#FF4D5E]">6.8 km² (8.2%)</strong>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[#94A3B8] text-[10px]">&bull; Infrastructure Corridors:</span>
            <strong className="text-amber-400">2.9 km² (3.5%)</strong>
          </div>
        </div>

        <button
          onClick={() => setActiveNavTab('NAVIGATION')}
          className="w-full mt-3 bg-[#19D3FF] hover:bg-[#287BFF] text-black hover:text-white font-mono font-bold text-xs py-2 rounded transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(25,211,255,0.3)]"
        >
          <Navigation size={13} />
          <span>CALCULATE EVACUATION ROUTES</span>
        </button>
      </div>
    </div>
  );
}
