import React from 'react';
import { Box, Layers, Zap, Thermometer, Wind, Droplets } from 'lucide-react';

export default function DigitalTwin() {
  return (
    <div className="flex flex-col h-full pointer-events-none">
      <div className="flex justify-between items-center mb-4 p-3 glass-panel pointer-events-auto">
        <h1 className="text-2xl font-bold text-white">City Digital Twin</h1>
        <div className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
          <Box className="w-4 h-4" />
          <span className="text-sm font-medium">Map Active</span>
        </div>
      </div>

      <div className="flex justify-between items-start flex-1 gap-6 w-full pointer-events-none">
        {/* Left Side Panel */}
        <div className="w-80 space-y-6 pointer-events-auto">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Infrastructure Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Power Grid</span>
                  <span className="text-emerald-400">98% Optimal</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Water Supply</span>
                  <span className="text-emerald-400">95% Optimal</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Telecom Networks</span>
                  <span className="text-amber-400">82% Degraded</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Environmental Sensors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center justify-center border border-white/10">
                <Thermometer className="text-rose-400 w-6 h-6 mb-2" />
                <span className="text-lg font-bold text-white">28°C</span>
                <span className="text-xs text-muted-foreground">Avg Temp</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center justify-center border border-white/10">
                <Wind className="text-cyan-400 w-6 h-6 mb-2" />
                <span className="text-lg font-bold text-white">12km/h</span>
                <span className="text-xs text-muted-foreground">Wind Speed</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg flex flex-col items-center justify-center border border-white/10 col-span-2">
                <Droplets className="text-blue-400 w-6 h-6 mb-2" />
                <span className="text-lg font-bold text-white">65%</span>
                <span className="text-xs text-muted-foreground">Humidity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-80 glass-panel p-6 flex flex-col pointer-events-auto h-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Structural Analysis</h3>
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-white font-medium flex justify-between">
                <span>Downtown Bridge</span>
                <span className="text-amber-400">Warning</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">Stress detected on pillar 4</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-white font-medium flex justify-between">
                <span>Central Hospital</span>
                <span className="text-emerald-400">Stable</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">Foundations intact, backup systems ready</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-white font-medium flex justify-between">
                <span>Metro Line Red</span>
                <span className="text-emerald-400">Stable</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">No seismic variations detected</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h4 className="text-white font-medium flex justify-between">
                <span>Coastal Dam</span>
                <span className="text-emerald-400">Stable</span>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">Water levels normal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
