import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Shield,
  Activity,
  Droplets,
  Compass,
  Eye,
  EyeOff,
  Crosshair,
  GitCommit
} from 'lucide-react';
import DigitalTwinMap from '../map/DigitalTwinMap';

export default function MapLayers() {
  const [layers, setLayers] = useState({
    boundary: true,
    roads: false,
    flood: true,
    weather: true,
    shelters: true,
    hospitals: true,
    rivers: true,
    bridges: true,
    dem: false,
    drainage: true
  });

  const [opacity, setOpacity] = useState(85);

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const layerItems = [
    { id: 'flood', label: 'SAR Flood Inundation Zones', color: '#EF4444', count: '196 zones', type: 'Polygon' },
    { id: 'drainage', label: 'Nagavali / Vamsadhara River Systems & Canals', color: '#0284C7', count: '934 segments', type: 'Vector' },
    { id: 'bridges', label: 'Surveyed Highway & Railway Bridges', color: '#7C3AED', count: '1,201 bridges', type: 'Infrastructure' },
    { id: 'weather', label: 'AWS Weather Telemetry Stations', color: '#2563EB', count: '8 stations', type: 'Point' },
    { id: 'shelters', label: 'Verified Designated Shelters & Relief Centers', color: '#10B981', count: '120 centers', type: 'Facility' },
    { id: 'hospitals', label: 'Emergency Hospitals & Health Centers', color: '#F43F5E', count: '46 units', type: 'Facility' },
    { id: 'roads', label: 'OSM Arterial Road Network', color: '#3B82F6', count: '171k nodes', type: 'Line' },
    { id: 'boundary', label: 'Authoritative Srikakulam District Boundary', color: '#6366F1', count: 'Survey of India', type: 'Boundary' },
    { id: 'dem', label: 'Copernicus 30m Elevation Model', color: '#8B5CF6', count: 'Raster', type: 'Surface' },
  ];

  return (
    <div className="w-full max-w-[1480px] mx-auto flex flex-col gap-4 pb-6 font-sans">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-[22px] font-bold text-[#0F265C] tracking-tight">
            Map &amp; Layers
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Explore verified geographic layers, satellite telemetry, and real-time operational data for Srikakulam.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Survey of India AOI Enforced</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN GIS WORKBENCH: LEFT LAYER CONTROL + RIGHT INTERACTIVE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* LEFT COLUMN: LAYER CONTROL & METADATA (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* Layer Management Card */}
          <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#2167F3]" />
                <h2 className="text-[14px] font-semibold text-[#0F265C]">
                  GIS Layer Manager
                </h2>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {Object.values(layers).filter(Boolean).length} Active
              </span>
            </div>

            {/* Layer Checkbox List */}
            <div className="space-y-2">
              {layerItems.map((layer) => {
                const isChecked = layers[layer.id];
                return (
                  <div
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-[#2167F3] focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer flex-shrink-0"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: layer.color }}
                      ></span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-medium text-slate-800 truncate">
                          {layer.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {layer.count} &bull; {layer.type}
                        </span>
                      </div>
                    </div>

                    <button
                      className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0"
                      title={isChecked ? 'Hide layer' : 'Show layer'}
                    >
                      {isChecked ? <Eye size={14} className="text-[#2167F3]" /> : <EyeOff size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Opacity Slider */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">Global Layer Opacity</span>
                <span className="font-bold text-[#0F265C] font-mono">{opacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2167F3]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20% (Subtle)</span>
                <span>100% (Solid)</span>
              </div>
            </div>
          </div>

          {/* Coordinate Reference & Projection Card */}
          <div className="bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all text-xs space-y-2">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-2.5 mb-3">
              <Crosshair size={15} className="text-[#2167F3]" />
              <h3 className="font-semibold text-[#0F265C] text-[13px]">
                Spatial Reference Metadata
              </h3>
            </div>
            <div className="flex justify-between text-slate-600 text-[11.5px]">
              <span>CRS:</span>
              <span className="font-mono font-semibold text-slate-800">EPSG:4326 (WGS 84)</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11.5px]">
              <span>Bounding Box:</span>
              <span className="font-mono text-slate-700">18.08°N – 19.17°N, 83.41°E – 84.77°E</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11.5px]">
              <span>Basemap Provider:</span>
              <span className="font-semibold text-slate-800">OpenStreetMap / Positron</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE GIS MAP (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-[#DCE6F5] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(15,38,92,0.04)] hover:border-[#BFDBFE] transition-all flex flex-col min-h-[580px]">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#2167F3]" />
              <h2 className="text-[14px] font-semibold text-[#0F265C]">
                Interactive Geographic Digital Twin
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Srikakulam Operational Territory
            </span>
          </div>

          {/* Map Container */}
          <div className="flex-1 rounded-lg overflow-hidden border border-[#DCE6F5] min-h-[500px]">
            <DigitalTwinMap height="100%" />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM STATS BAR (4 Stat Cards Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Weather Points */}
        <div className="bg-white border border-[#DCE6F5] rounded-xl p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2167F3] flex items-center justify-center flex-shrink-0">
            <Activity size={16} />
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 uppercase font-semibold block">Weather Points</span>
            <span className="text-sm font-bold text-[#0F265C]">8 Stations</span>
          </div>
        </div>

        {/* Shelters */}
        <div className="bg-white border border-[#DCE6F5] rounded-xl p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center flex-shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 uppercase font-semibold block">Shelters</span>
            <span className="text-sm font-bold text-[#0F265C]">120 Centers</span>
          </div>
        </div>

        {/* Hospitals */}
        <div className="bg-white border border-[#DCE6F5] rounded-xl p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} />
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 uppercase font-semibold block">Hospitals</span>
            <span className="text-sm font-bold text-[#0F265C]">46 Units</span>
          </div>
        </div>

        {/* Flood Zones */}
        <div className="bg-white border border-[#DCE6F5] rounded-xl p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <Droplets size={16} />
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 uppercase font-semibold block">Flood Zones</span>
            <span className="text-sm font-bold text-[#0F265C]">196 Polygons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
