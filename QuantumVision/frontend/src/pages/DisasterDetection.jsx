import React from 'react';
import { Camera, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export default function DisasterDetection() {
  return (
    <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Disaster Detection</h1>
        <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Sensors</h3>
            <Activity className="text-cyan-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">1,248</p>
          <p className="text-sm text-emerald-400 mt-2">↑ 99.8% Uptime</p>
        </div>
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Anomalies Detected</h3>
            <AlertTriangle className="text-amber-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">14</p>
          <p className="text-sm text-amber-400 mt-2">Requires Review</p>
        </div>
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Critical Alerts</h3>
            <ShieldAlert className="text-rose-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">2</p>
          <p className="text-sm text-rose-400 mt-2">Action Required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-cyan-400" />
            Live Camera Feeds
          </h3>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center min-h-[150px]">
              <span className="text-slate-500">Camera 1 - Coastal</span>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center min-h-[150px]">
              <span className="text-slate-500">Camera 2 - Downtown</span>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center min-h-[150px]">
              <span className="text-slate-500">Camera 3 - Fault Line</span>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center min-h-[150px]">
              <span className="text-slate-500">Camera 4 - River</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Detections</h3>
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                  <h4 className="text-white font-medium">Seismic Activity Level {i}</h4>
                  <p className="text-sm text-muted-foreground">Region Alpha - {i * 2} mins ago</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                  Investigating
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
