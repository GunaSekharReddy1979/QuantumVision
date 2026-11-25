import React from 'react';
import { useMap } from '../../context/MapContext';
import { Check } from 'lucide-react';

export default function LayerControlPanel() {
  const { layers, toggleLayer } = useMap();

  const gisLayers = [
    { key: 'boundary', label: 'Boundary' },
    { key: 'waterways', label: 'Rivers' },
    { key: 'floodInundation', label: 'Flood Extent' },
    { key: 'riskZones', label: 'Risk Zones' },
    { key: 'roads', label: 'Roads' },
    { key: 'evacuationRoutes', label: 'Routes' },
    { key: 'shelters', label: 'Shelters' },
    { key: 'hospitals', label: 'Hospitals' },
    { key: 'rainfall', label: 'Rainfall' },
    { key: 'terrain', label: 'DEM' },
    { key: 'satellite', label: 'Satellite' },
  ];

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center select-none max-w-[95%]">
      <div className="flex items-center space-x-1.5 bg-[#040C1A]/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#14355E] shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
        {/* Label */}
        <span className="text-[9px] font-mono font-black text-[#19D3FF] uppercase tracking-wider pr-1.5 border-r border-[#14355E] hidden sm:inline">
          GIS LAYERS
        </span>

        {/* 11 Layer Chips from Specification Section 9 */}
        <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar py-0.5">
          {gisLayers.map((layer) => {
            const isActive = !!layers[layer.key];
            return (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${isActive
                    ? 'bg-[#0B2A54] text-[#19D3FF] border border-[#19D3FF]/70 shadow-[0_0_8px_rgba(25,211,255,0.3)]'
                    : 'bg-[#051020] text-[#7B92B2] hover:text-white border border-white/5'
                  }`}
                title={`Toggle ${layer.label} Layer`}
              >
                <div className={`w-2 h-2 rounded-full flex items-center justify-center border ${isActive ? 'border-[#19D3FF] bg-[#19D3FF]' : 'border-[#4A5D75]'
                  }`}>
                  {isActive && <Check size={7} className="text-black stroke-[3]" />}
                </div>
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
