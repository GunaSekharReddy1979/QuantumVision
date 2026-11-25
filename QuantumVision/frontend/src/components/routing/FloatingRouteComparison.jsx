import React from 'react';
import { useMap } from '../../context/MapContext';
import { Navigation, Clock, ShieldCheck, AlertTriangle, ArrowRight, X, Shuffle } from 'lucide-react';

export default function FloatingRouteComparison() {
  const { activeRoute, setActiveRoute, alternativeRoute, setAlternativeRoute } = useMap();

  if (!activeRoute) return null;

  const handleSwapRoute = () => {
    if (alternativeRoute) {
      const temp = activeRoute;
      setActiveRoute(alternativeRoute);
      setAlternativeRoute(temp);
    }
  };

  const handleClose = () => {
    setActiveRoute(null);
  };

  return (
    <div className="absolute bottom-24 right-96 z-40 w-96 bg-[#050B14]/90 backdrop-blur-md rounded border border-[#19D3FF]/40 p-3.5 shadow-[0_0_30px_rgba(25,211,255,0.25)] pointer-events-auto tech-corners animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#19D3FF]/20 pb-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <Navigation size={14} className="text-[#19D3FF]" />
          <h3 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
            EVACUATION ROUTE
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="source-badge source-model">
            [MODEL-DERIVED]
          </span>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Start and Destination */}
      <div className="space-y-1.5 text-xs font-mono mb-3">
        <div className="flex items-center justify-between bg-[#07111F]/80 p-1.5 rounded border border-white/5">
          <span className="text-[#94A3B8] text-[9px] uppercase">START:</span>
          <span className="text-white font-medium truncate max-w-[240px]">
            {activeRoute.origin_name || 'Selected origin'}
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#07111F]/80 p-1.5 rounded border border-white/5">
          <span className="text-[#94A3B8] text-[9px] uppercase">DESTINATION:</span>
          <span className="text-[#19D3FF] font-bold truncate max-w-[240px]">
            {activeRoute.destination_name || 'Selected destination'}
          </span>
        </div>
      </div>

      {/* Key Route Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center mb-3">
        <div className="bg-[#0A1626] p-2 rounded border border-[#19D3FF]/20">
          <span className="text-[9px] text-[#64748B] block uppercase">DISTANCE</span>
          <span className="text-sm font-bold text-white">
            {activeRoute.distance_km ?? '—'} km
          </span>
        </div>

        <div className="bg-[#0A1626] p-2 rounded border border-[#19D3FF]/20">
          <span className="text-[9px] text-[#64748B] block uppercase">EST. TIME</span>
          <span className="text-sm font-bold text-[#19D3FF]">
            {activeRoute.duration_min ?? activeRoute.eta_min ?? '—'} min
          </span>
        </div>

        <div className="bg-[#0A1626] p-2 rounded border border-[#19D3FF]/20">
          <span className="text-[9px] text-[#64748B] block uppercase">RISK SCORE</span>
          <span className="text-sm font-bold text-[#32E875]">
            {activeRoute.hazard_exposure || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Algorithm & Alternatives Switcher */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <span>ALGORITHM:</span>
          <span className="text-white font-bold">{activeRoute.algorithm || 'A* (Spatial Goal-Directed)'}</span>
        </div>

        {alternativeRoute && (
          <button
            onClick={handleSwapRoute}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-[#19D3FF]/15 text-[#19D3FF] hover:bg-[#19D3FF]/30 transition-all cursor-pointer"
          >
            <Shuffle size={10} />
            <span>SWITCH TO ALT</span>
          </button>
        )}
      </div>
    </div>
  );
}
