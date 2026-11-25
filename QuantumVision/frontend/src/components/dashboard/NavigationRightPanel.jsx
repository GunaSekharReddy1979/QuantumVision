import React from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Milestone, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  CheckCircle2,
  ChevronRight,
  Info,
  Play,
  Square,
  ChevronLeft,
  Flame,
  Droplets,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useMap } from '../../context/MapContext';

export default function NavigationRightPanel() {
  const {
    origin,
    selectedShelter,
    activeRoute,
    alternativeRoute,
    selectedRouteType,
    switchRouteType,
    isNavigating,
    startNavigation,
    stopNavigation,
    activeStepIndex,
    setActiveStepIndex,
    navigationSteps,
    nextStep,
    prevStep
  } = useMap();

  const currentRoute = selectedRouteType === 'primary' ? activeRoute : alternativeRoute;

  // Derive dynamic operational data from actual shelter and route state
  const destinationName = selectedShelter?.name || 'Srikakulam Municipal Relief Complex';
  const destinationLocation = selectedShelter?.location || 'Srikakulam';
  const distanceKm = currentRoute?.distance_km ?? '—';
  const etaMin = currentRoute?.eta_min ?? '—';
  const totalCap = selectedShelter?.totalCapacity || 420;
  const occupiedCap = selectedShelter?.currentOccupancy || 240;
  const availableBeds = selectedShelter?.availableCapacity ?? Math.max(0, totalCap - occupiedCap);
  const occupancyPercent = selectedShelter?.occupancyPercent ?? Math.round((occupiedCap / totalCap) * 100);
  const shelterStatus = selectedShelter?.isOpen ? 'OPEN' : 'CLOSED';
  const routeAlgorithm = currentRoute?.algorithm || 'Unavailable';
  const floodExposure = currentRoute?.flood_exposure || 'Unknown';
  const blockedRoads = currentRoute?.blocked_roads ?? 'Unknown';

  return (
    <div className="flex flex-col space-y-3 text-white font-sans select-none pb-4">
      {/* 1. SECTION 7: DESTINATION DETAILS CARD */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              DESTINATION INFORMATION
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase bg-[#32E875]/20 text-[#32E875] border border-[#32E875]/40">
            {shelterStatus}
          </span>
        </div>

        {/* Shelter Header */}
        <div className="mb-3">
          <span className="text-[8.5px] font-mono text-[#7B92B2] uppercase block">
            SELECTED DESTINATION
          </span>
          <h3 className="text-sm font-bold text-white leading-snug mt-0.5">
            {destinationName}
          </h3>
          <p className="text-[10px] font-mono text-[#19D3FF] mt-0.5">
            {destinationLocation}
          </p>
        </div>

        {/* Dynamic Key Value Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Distance</span>
            <span className="text-base font-bold text-white">{distanceKm} km</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Estimated Time</span>
            <span className="text-base font-bold text-white">{etaMin} min</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Mapped Flood Exposure</span>
            <span className="text-sm font-bold text-white">{floodExposure}</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Shelter Capacity</span>
            <span className="text-sm font-bold text-white">{totalCap} Beds</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Available Beds</span>
            <span className="text-sm font-bold text-[#32E875]">{availableBeds}</span>
          </div>

          <div className="bg-[#08152B] p-2 rounded border border-white/5">
            <span className="text-[8px] text-[#7B92B2] uppercase block">Occupancy Rate</span>
            <span className="text-sm font-bold text-[#19D3FF]">{occupancyPercent}%</span>
          </div>
        </div>

        {/* Capacity Occupancy Progress Bar */}
        <div className="bg-[#08152B] p-2 rounded border border-white/5 mb-3 text-xs font-mono">
          <div className="flex justify-between text-[9px] mb-1">
            <span className="text-[#7B92B2]">Bed Allocation</span>
            <span className="text-white font-bold">{occupiedCap} / {totalCap} Occupied</span>
          </div>
          <div className="w-full h-1.5 bg-[#030814] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercent > 85 ? 'bg-[#FF4D5E]' : occupancyPercent > 65 ? 'bg-[#FFD54A]' : 'bg-[#32E875]'
              }`}
              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
            />
          </div>
        </div>

        {/* Technical Routing Meta */}
        <div className="bg-[#030A17] p-2.5 rounded border border-[#19D3FF]/20 space-y-1 text-[9.5px] font-mono mb-3">
          <div className="flex justify-between">
            <span className="text-[#7B92B2]">Route Computation:</span>
            <span className="text-[#19D3FF] font-bold">{routeAlgorithm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7B92B2]">Flood Exposure:</span>
            <span className="text-[#32E875] font-semibold">{floodExposure}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {!isNavigating ? (
            <button
              onClick={startNavigation}
              disabled={!currentRoute || navigationSteps.length === 0}
              className="bg-[#10B981] hover:bg-[#059669] text-black hover:text-white font-mono font-bold text-xs py-2 px-3 rounded flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play size={13} fill="currentColor" />
              <span>REVIEW ROUTE</span>
            </button>
          ) : (
            <button
              onClick={stopNavigation}
              className="bg-[#FF4D5E] hover:bg-[#E11D48] text-white font-mono font-bold text-xs py-2 px-3 rounded flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(255,77,94,0.4)] transition-all cursor-pointer animate-pulse"
            >
              <Square size={13} fill="currentColor" />
              <span>STOP REVIEW</span>
            </button>
          )}

          <button
            onClick={() => {
              // Focus onto the left panel shelter selector
              const listElem = document.querySelector('.custom-scrollbar');
              if (listElem) listElem.scrollTop = 0;
            }}
            className="bg-[#08152B] hover:bg-[#0C2444] text-[#19D3FF] border border-[#19D3FF]/30 hover:border-[#19D3FF] font-mono font-bold text-[10px] py-2 px-2 rounded flex items-center justify-center space-x-1 transition-all cursor-pointer"
          >
            <span>CHANGE SHELTER</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. SECTION 8: ROUTE TELEMETRY SUMMARY */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Milestone size={14} className="text-[#19D3FF]" />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              EVACUATION ROUTE METRICS
            </h2>
          </div>
          <span className="text-[9px] font-mono text-[#7B92B2]">ROUTE SUMMARY</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Origin:</span>
            <span className="text-white font-semibold">{origin.name}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Destination:</span>
            <span className="text-[#10B981] font-semibold">{destinationName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Route Distance:</span>
            <span className="text-white font-bold">{distanceKm} km</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Estimated Time:</span>
            <span className="text-white font-bold">{etaMin} min</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Algorithm:</span>
            <span className="text-[#19D3FF] font-bold">{currentRoute?.algorithm || 'A*'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Flood Exposure:</span>
            <span className="text-white font-medium">{floodExposure}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-[#7B92B2]">Blocked Roads:</span>
            <span className="text-white font-bold">{blockedRoads}</span>
          </div>

        </div>
      </div>

      {/* 3. SECTION 12: TURN-BY-TURN NAVIGATION HUD */}
      <div className="bg-[#050D1C]/95 p-3.5 rounded-lg border border-[#143257] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <Navigation size={14} className={isNavigating ? 'text-[#10B981] animate-spin' : 'text-[#19D3FF]'} />
            <h2 className="text-xs font-mono font-bold tracking-[0.16em] text-white uppercase">
              {isNavigating ? 'ROUTE REVIEW IN PROGRESS' : 'ROUTE SEGMENT GUIDANCE'}
            </h2>
          </div>
          {isNavigating && (
            <span className="px-1.5 py-0.2 rounded text-[7.5px] font-mono font-extrabold uppercase bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 animate-pulse">
              REVIEWING
            </span>
          )}
        </div>

        {/* Step navigation controls */}
        {isNavigating && (
          <div className="flex items-center justify-between bg-[#08152B] p-1.5 rounded mb-2 text-xs font-mono">
            <button
              onClick={prevStep}
              disabled={activeStepIndex === 0}
              className="p-1 rounded bg-[#030814] text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[9px] text-[#19D3FF] font-bold">
              STEP {activeStepIndex + 1} OF {navigationSteps.length}
            </span>
            <button
              onClick={nextStep}
              disabled={activeStepIndex === navigationSteps.length - 1}
              className="p-1 rounded bg-[#030814] text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="space-y-2">
          {navigationSteps.length === 0 ? (
            <p className="text-[10px] font-mono text-[#7B92B2]">
              Road-segment guidance is unavailable until a route with mapped road details is calculated.
            </p>
          ) : navigationSteps.map((step, idx) => {
            const isActive = isNavigating && activeStepIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => isNavigating && setActiveStepIndex(idx)}
                className={`p-2.5 rounded border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0C2D44] border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-[#08152B] border-white/5 hover:border-[#19D3FF]/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-mono font-bold shrink-0 mt-0.5 ${
                      isActive ? 'bg-[#10B981] text-black font-extrabold' : 'bg-[#143257] text-[#19D3FF]'
                    }`}>
                      {step.step}
                    </span>
                    <p className="text-[10px] font-mono text-white leading-tight">
                      {step.instruction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8.5px] font-mono mt-1.5 pt-1 border-t border-white/5 text-[#7B92B2]">
                  {step.distance_m > 0 ? (
                    <span>Distance: <strong className="text-white">{step.distance_m} m</strong></span>
                  ) : (
                    <span className="text-[#32E875] font-bold">Destination Check-in</span>
                  )}
                  <span className={`font-semibold ${
                    step.flood_affected_edges > 0 ? 'text-amber-400' : 'text-[#7B92B2]'
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
