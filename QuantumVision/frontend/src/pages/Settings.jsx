import React, { useState } from 'react';
import {
  Server,
  Phone,
  CheckCircle2,
  Info,
  Compass,
} from 'lucide-react';

export default function Settings() {
  const [forecastDefault, setForecastDefault] = useState('24');
  const [routingDefault, setRoutingDefault] = useState('astar');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-[1480px] mx-auto flex flex-col gap-4 pb-6 font-sans">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-[22px] font-bold text-[#0F265C] tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            System configuration, API data sources, and operational defaults.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <CheckCircle2 size={13} />
          <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* 2. MAIN 2x2 SETTINGS GRID (Matches WhatsApp Image 2026-10-31 at 19.33.32.jpeg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: API & Data Source Status */}
        <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all space-y-3.5">
          <div className="border-b border-[#F1F5F9] pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-[#2563EB]" />
              <h2 className="text-[14px] font-semibold text-[#0F265C]">
                API &amp; Data Source Status
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-[#F1F5F9]">
              <div>
                <span className="font-bold text-slate-900 block">FastAPI Backend</span>
                <span className="text-[11px] text-slate-500 font-mono">http://localhost:8000/api</span>
              </div>
              <span className="text-[#059669] font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span>Online</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-[#F1F5F9]">
              <div>
                <span className="font-bold text-slate-900 block">Open-Meteo Weather API</span>
                <span className="text-[11px] text-slate-500">ECMWF IFS / GFS Global Weather</span>
              </div>
              <span className="text-[#059669] font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span>Live Feed</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-[#F1F5F9]">
              <div>
                <span className="font-bold text-slate-900 block">GIS Road Network Engine</span>
                <span className="text-[11px] text-slate-500">171,080 Srikakulam Arterial Nodes</span>
              </div>
              <span className="text-[#059669] font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span>Ready</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-[#F1F5F9]">
              <div>
                <span className="font-bold text-slate-900 block">Quantum Simulator (PennyLane)</span>
                <span className="text-[11px] text-slate-500">4-Qubit default.qubit Statevector</span>
              </div>
              <span className="text-[#7C3AED] font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                <span>Simulator</span>
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Operational Defaults */}
        <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all space-y-3.5">
          <div className="border-b border-[#F1F5F9] pb-2.5">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#2563EB]" />
              <h2 className="text-[14px] font-semibold text-[#0F265C]">
                Operational Defaults
              </h2>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Default Forecast Horizon
              </label>
              <select
                value={forecastDefault}
                onChange={(e) => setForecastDefault(e.target.value)}
                className="w-full bg-white border border-[#DCE6F5] rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Recommended)</option>
                <option value="48">48 Hours</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Default Routing Algorithm
              </label>
              <select
                value={routingDefault}
                onChange={(e) => setRoutingDefault(e.target.value)}
                className="w-full bg-white border border-[#DCE6F5] rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              >
                <option value="astar">A* Algorithm (Dynamic Flood Avoidance)</option>
                <option value="dijkstra">Dijkstra Shortest Path</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 mt-2">
              <span className="font-bold text-[#0F265C] block">Map Theme Enforcement:</span>
              <span className="text-[11.5px] text-slate-600 block mt-1 leading-relaxed">
                CartoDB Positron clean light basemap is permanently enabled. Dark-map options have been deprecated.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contacts */}
        <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all space-y-3.5">
          <div className="border-b border-[#F1F5F9] pb-2.5">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#10B981]" />
              <h2 className="text-[14px] font-semibold text-[#0F265C]">
                Emergency &amp; DDMA Contacts
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50/70 border border-[#F1F5F9]">
              <div>
                <span className="font-bold text-slate-900 block">Srikakulam District EOC</span>
                <span className="text-[11px] text-slate-500">Toll Free Emergency Control Room</span>
              </div>
              <span className="font-bold text-[#2563EB] font-mono text-xs">1077 / +91-8942-222550</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50/70 border border-[#F1F5F9]">
              <div>
                <span className="font-bold text-slate-900 block">AP State Disaster Response Force (SDRF)</span>
                <span className="text-[11px] text-slate-500">Emergency Dispatch</span>
              </div>
              <span className="font-bold text-[#2563EB] font-mono text-xs">112 / 1070</span>
            </div>
          </div>
        </div>

        {/* Section 4: System Information */}
        <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all space-y-3.5">
          <div className="border-b border-[#F1F5F9] pb-2.5">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[#2563EB]" />
              <h2 className="text-[14px] font-semibold text-[#0F265C]">
                System Information
              </h2>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-slate-500">Application:</span>
              <span className="font-bold text-[#0F265C]">QuantumVision Disaster EOC</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-slate-500">Version:</span>
              <span className="font-medium text-slate-900">2.0.0 (Light Theme Edition)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-slate-500">Region:</span>
              <span className="font-medium text-slate-900">Srikakulam District, Andhra Pradesh</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">CRS:</span>
              <span className="font-mono text-slate-900">EPSG:4326 (WGS 84)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
