import React from 'react';
import { Truck, ShieldAlert, Users, Radio, Crosshair, AlertTriangle } from 'lucide-react';

export default function EmergencyResponse() {
  return (
    <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Emergency Response Coordination</h1>
        <div className="flex items-center space-x-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/50">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">DEFCON 3</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Incidents</h3>
            <AlertTriangle className="text-rose-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-white">24</p>
          <p className="text-xs text-rose-400 mt-2">8 Critical Priority</p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Available Units</h3>
            <Truck className="text-emerald-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-white">142</p>
          <p className="text-xs text-emerald-400 mt-2">68% Deployment Rate</p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Personnel On-Site</h3>
            <Users className="text-cyan-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-white">850</p>
          <p className="text-xs text-cyan-400 mt-2">Across 12 zones</p>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Response Time</h3>
            <Crosshair className="text-amber-400 w-4 h-4" />
          </div>
          <p className="text-3xl font-bold text-white">8.4m</p>
          <p className="text-xs text-amber-400 mt-2">-1.2m vs average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Active Dispatch Table */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Live Dispatch Feed</h3>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="p-3 rounded-tl-lg">ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Assigned Units</th>
                  <th className="p-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">#INC-4029</td>
                  <td className="p-3 text-rose-400">Structural Collapse</td>
                  <td className="p-3 text-slate-300">Downtown Sector 4</td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-xs">Fire (2)</span>
                      <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-xs">EMS (3)</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center text-amber-400 text-xs font-medium">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse"></div>
                      In Progress
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">#INC-4028</td>
                  <td className="p-3 text-amber-400">Evacuation Assist</td>
                  <td className="p-3 text-slate-300">Coastal Route B</td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">Police (4)</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center text-amber-400 text-xs font-medium">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse"></div>
                      In Progress
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">#INC-4027</td>
                  <td className="p-3 text-rose-400">Medical Emergency</td>
                  <td className="p-3 text-slate-300">Shelter Alpha</td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-xs">EMS (1)</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center text-emerald-400 text-xs font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                      Resolved
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">#INC-4026</td>
                  <td className="p-3 text-rose-400">Hazardous Spill</td>
                  <td className="p-3 text-slate-300">Industrial Zone</td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">Hazmat (2)</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center text-rose-400 text-xs font-medium">
                      <div className="w-2 h-2 rounded-full bg-rose-400 mr-2 animate-pulse"></div>
                      Critical
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comms Panel */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Radio className="w-5 h-5 mr-2 text-emerald-400" />
            Unit Communications
          </h3>
          
          <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 p-4 space-y-4 overflow-y-auto">
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400">Dispatch</span>
                <span className="text-slate-500">11:42 AM</span>
              </div>
              <p className="text-sm text-slate-300 bg-slate-800 p-2 rounded-lg rounded-tl-none">All units in Sector 4, be advised of aftershock warnings in effect for the next hour.</p>
            </div>
            
            <div className="flex flex-col space-y-1 items-end">
              <div className="flex justify-between items-center text-xs w-full flex-row-reverse">
                <span className="font-bold text-cyan-400">EMS-04</span>
                <span className="text-slate-500">11:44 AM</span>
              </div>
              <p className="text-sm text-slate-300 bg-cyan-900/30 border border-cyan-900/50 p-2 rounded-lg rounded-tr-none">Copy that. We are on site at INC-4029. Requesting backup for heavy debris removal.</p>
            </div>

            <div className="flex flex-col space-y-1 items-end">
              <div className="flex justify-between items-center text-xs w-full flex-row-reverse">
                <span className="font-bold text-rose-400">Fire-12</span>
                <span className="text-slate-500">11:45 AM</span>
              </div>
              <p className="text-sm text-slate-300 bg-rose-900/30 border border-rose-900/50 p-2 rounded-lg rounded-tr-none">En route to INC-4029. ETA 4 minutes.</p>
            </div>
            
             <div className="flex flex-col space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400">Dispatch</span>
                <span className="text-slate-500">11:46 AM</span>
              </div>
              <p className="text-sm text-slate-300 bg-slate-800 p-2 rounded-lg rounded-tl-none">Copy Fire-12.</p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <input type="text" placeholder="Broadcast message to units..." className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-md transition-colors">
              <Radio className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
