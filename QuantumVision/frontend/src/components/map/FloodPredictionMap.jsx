import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function FloodPredictionMap({ points = [], selectedPoint = null, onSelectPoint }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.2969, 83.8968],
      zoom: 9.5,
      zoomControl: false,
      attributionControl: false,
      minZoom: 7,
      maxZoom: 16
    });

    // Dark Matter basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      className: 'dark-carto-tiles'
    }).addTo(map);

    // Zoom controls at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update GIS Risk Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersGroupRef.current) {
      map.removeLayer(markersGroupRef.current);
      markersGroupRef.current = null;
    }

    const group = L.featureGroup();

    points.forEach((pt) => {
      const isSelected = selectedPoint?.id === pt.id;
      const isSevere = pt.risk_category === 'SEVERE';
      const isHigh = pt.risk_category === 'HIGH';
      const isMod = pt.risk_category === 'MODERATE';

      const color = isSevere ? '#FF2638' : (isHigh ? '#FF4D5E' : (isMod ? '#F59E0B' : '#10B981'));
      const glowColor = isSevere ? 'rgba(255,38,56,0.6)' : (isHigh ? 'rgba(255,77,94,0.5)' : (isMod ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'));

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
          ${(isSevere || isHigh || isSelected) ? `<span class="absolute w-7 h-7 rounded-full animate-ping" style="background: ${glowColor};"></span>` : ''}
          <div class="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white font-mono font-bold text-[8px] shadow-[0_0_12px_${color}]" style="background: ${color};">
            ${pt.risk_category[0]}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'flood-risk-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([pt.latitude, pt.longitude], { icon, zIndexOffset: isSelected ? 1000 : 300 });

      // Dynamic Tooltip (Section 18)
      const tooltipHtml = `
        <div style="padding: 10px; width: 230px; font-family: monospace; background: rgba(5,13,28,0.96); border: 1px solid ${color}; border-radius: 8px; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 6px;">
            <span style="font-size: 8.5px; color: #19D3FF; font-weight: bold; text-transform: uppercase;">
              ${pt.district}
            </span>
            <span style="font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 2px; text-transform: uppercase; background: ${glowColor}; color: white;">
              ${pt.risk_category}
            </span>
          </div>
          <h5 style="font-size: 11px; font-weight: bold; color: white; margin: 0 0 6px 0; line-height: 1.2;">
            ${pt.station}
          </h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9.5px; margin-bottom: 6px;">
            <span style="color: #7B92B2;">Flood Probability:</span><strong style="text-align: right; color: ${color};">${pt.probability}%</strong>
            <span style="color: #7B92B2;">Current Rainfall:</span><strong style="text-align: right; color: white;">${pt.current_rainfall_mm} mm</strong>
            <span style="color: #7B92B2;">7-Day Rainfall:</span><strong style="text-align: right; color: white;">${pt.cum_7d_rainfall_mm} mm</strong>
            <span style="color: #7B92B2;">Model:</span><strong style="text-align: right; color: #19D3FF;">${pt.model}</strong>
          </div>
          <div style="font-size: 8px; color: #7B92B2; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px; display: flex; justify-content: space-between;">
            <span>Last Updated:</span>
            <span style="color: white;">${pt.last_updated}</span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, -10],
        className: 'hud-tooltip',
        opacity: 1
      });

      marker.on('click', () => {
        if (onSelectPoint) onSelectPoint(pt);
      });

      marker.addTo(group);
    });

    // Add Nagavali & Vamsadhara rivers
    const riverCoords = [
      [[18.23, 83.92], [18.28, 83.90], [18.31, 83.89], [18.36, 83.85], [18.42, 83.82]],
      [[18.35, 84.14], [18.42, 84.08], [18.52, 84.02], [18.62, 83.95]]
    ];
    riverCoords.forEach(coords => {
      L.polyline(coords, {
        color: '#00E5FF',
        weight: 2.2,
        opacity: 0.85
      }).addTo(group);
    });

    group.addTo(map);
    markersGroupRef.current = group;
  }, [points, selectedPoint, onSelectPoint]);

  return (
    <div className="w-full h-full relative z-0 overflow-hidden rounded-lg border border-[#143257] bg-[#030814]">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 z-20 pointer-events-auto bg-[#050D1C]/92 backdrop-blur-md rounded border border-[#143257] p-2 text-[8.5px] font-mono select-none">
        <div className="text-[7.5px] text-[#7B92B2] uppercase font-bold mb-1">PREDICTED FLOOD RISK</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#FF2638]" />
            <span className="text-slate-300">Severe Risk (&ge;80%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#FF4D5E]" />
            <span className="text-slate-300">High Risk (55-80%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-300">Moderate (25-55%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-slate-300">Low Risk (&lt;25%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
