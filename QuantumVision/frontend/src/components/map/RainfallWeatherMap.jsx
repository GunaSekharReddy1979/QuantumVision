import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RainfallWeatherMap({
  locations = [],
  selectedLocationId = null,
  onSelectLocation = () => {},
  districtSummary = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const geojsonLayerRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Srikakulam district centroid
    const map = L.map(mapContainerRef.current, {
      center: [18.58, 84.05],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
      minZoom: 8,
      maxZoom: 15
    });

    // Clean Light Basemap (OpenStreetMap Standard)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Load verified Srikakulam district boundary GeoJSON
    fetch('/data/srikakulam_boundary.geojson')
      .then(res => res.json())
      .then(geojsonData => {
        if (!mapInstanceRef.current) return;
        geojsonLayerRef.current = L.geoJSON(geojsonData, {
          style: {
            color: '#2563EB',
            weight: 2,
            opacity: 0.85,
            dashArray: '4, 4',
            fillColor: '#3B82F6',
            fillOpacity: 0.05
          }
        }).addTo(mapInstanceRef.current);
      })
      .catch(err => {
        console.warn('Could not load Srikakulam boundary GeoJSON:', err);
      });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render weather point markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersGroupRef.current) {
      map.removeLayer(markersGroupRef.current);
      markersGroupRef.current = null;
    }

    const group = L.featureGroup();

    locations.forEach((pt) => {
      const isSelected = selectedLocationId === pt.point_id;
      const rain = pt.accumulated_precipitation_24h_mm ?? 0.0;

      // Color coding based on IMD 24h rainfall categories
      let markerColor = '#10B981'; // Green: Light / Normal (<15.6mm)
      let badgeLabel = 'LIGHT';
      if (rain >= 64.5) {
        markerColor = '#EF4444'; // Red: Heavy (>=64.5mm)
        badgeLabel = 'HEAVY';
      } else if (rain >= 15.6) {
        markerColor = '#F59E0B'; // Orange/Yellow: Moderate
        badgeLabel = 'MODERATE';
      }

      const customIcon = L.divIcon({
        className: 'custom-weather-marker',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '30px' : '24px'};
            height: ${isSelected ? '30px' : '24px'};
            background: #FFFFFF;
            border: 2px solid ${isSelected ? '#2563EB' : markerColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${markerColor};
            "></div>
          </div>
        `,
        iconSize: [isSelected ? 30 : 24, isSelected ? 30 : 24],
        iconAnchor: [isSelected ? 15 : 12, isSelected ? 15 : 12]
      });

      const marker = L.marker([pt.latitude, pt.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; color: #1E293B; background: #FFFFFF; padding: 10px; border-radius: 6px; min-width: 180px;">
          <div style="font-weight: bold; color: #0F172A; font-size: 13px; margin-bottom: 4px; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px;">
            ${pt.name}
          </div>
          <div style="color: #64748B; margin-bottom: 3px;">Zone: <span style="color: #0F172A; font-weight: 500;">${pt.zone || 'District Grid'}</span></div>
          <div style="color: #64748B; margin-bottom: 3px;">River Basin: <span style="color: #0F172A; font-weight: 500;">${pt.river_basin || 'Nagavali/Vamsadhara'}</span></div>
          <div style="color: #64748B; margin-bottom: 3px;">Elevation: <span style="color: #0F172A; font-weight: 500;">${pt.elevation_m} m</span></div>
          <div style="color: #64748B; margin-bottom: 3px;">24h Rain: <span style="color: ${markerColor}; font-weight: bold; font-size: 13px;">${rain} mm</span></div>
          <div style="color: #64748B; margin-bottom: 3px;">Peak Intensity: <span style="color: #0F172A; font-weight: 500;">${pt.max_hourly_intensity_mm || 0} mm/h</span></div>
          <div style="margin-top: 6px; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${markerColor}15; color: ${markerColor}; border: 1px solid ${markerColor}40;">
            ${badgeLabel} PRECIP
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectLocation(pt.point_id);
      });

      group.addLayer(marker);
    });

    group.addTo(map);
    markersGroupRef.current = group;
  }, [locations, selectedLocationId]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg text-xs space-y-1.5 shadow-md pointer-events-none text-slate-800">
        <div className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">
          Srikakulam Weather Grid
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span>
          <span>Light / Normal (&lt;15.6 mm)</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block"></span>
          <span>Moderate Rain (15.6 - 64.5 mm)</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block"></span>
          <span>Heavy Rain (&ge;64.5 mm)</span>
        </div>
        <div className="pt-1.5 border-t border-slate-100 flex items-center space-x-2 text-[10px] text-slate-500">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-blue-600 inline-block"></span>
          <span>District Boundary</span>
        </div>
      </div>
    </div>
  );
}
