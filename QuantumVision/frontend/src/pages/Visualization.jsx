import React from 'react';
import { Layers, Eye, Image as ImageIcon, Video, Filter } from 'lucide-react';

export default function Visualization() {
  return (
    <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Advanced Visualization</h1>
        <div className="flex items-center space-x-2 bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Multi-spectral Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Layer Controls */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-pink-400" />
            Data Layers
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-white">Satellite Imagery</span>
              <input type="checkbox" defaultChecked className="accent-pink-500 w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-white">Thermal Map</span>
              <input type="checkbox" defaultChecked className="accent-pink-500 w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-white">Topography</span>
              <input type="checkbox" className="accent-pink-500 w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-white">Population Heatmap</span>
              <input type="checkbox" className="accent-pink-500 w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-sm text-white">Infrastructure Grid</span>
              <input type="checkbox" defaultChecked className="accent-pink-500 w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-auto">
            <button className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md py-2 transition-colors border border-slate-700">
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="lg:col-span-3 glass-panel p-2 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900 rounded-xl overflow-hidden">
            {/* Base Image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
            
            {/* Thermal Overlay Mock */}
            <div className="absolute inset-0 opacity-50" style={{
              background: 'radial-gradient(circle at 70% 30%, rgba(244, 63, 94, 0.8) 0%, rgba(245, 158, 11, 0.5) 20%, transparent 50%), radial-gradient(circle at 30% 60%, rgba(244, 63, 94, 0.6) 0%, rgba(245, 158, 11, 0.4) 15%, transparent 40%)'
            }}></div>
            
            {/* Grid Overlay Mock */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative z-10 flex justify-end p-4">
             <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-slate-700 flex space-x-2">
               <button className="p-1.5 bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30 transition-colors">
                 <ImageIcon className="w-4 h-4" />
               </button>
               <button className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 transition-colors">
                 <Video className="w-4 h-4" />
               </button>
             </div>
          </div>
          
          <div className="relative z-10 mt-auto p-4">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl max-w-md">
              <h4 className="text-white font-medium mb-1">Sector 7 Alpha - Thermal Anomaly</h4>
              <p className="text-sm text-slate-400 mb-3">High heat signatures detected consistent with urban fires. Spread velocity estimated at 4.2 km/h.</p>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/30">Critical</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">Lat: 34.0522</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">Long: -118.2437</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
