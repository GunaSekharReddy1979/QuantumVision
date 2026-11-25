import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Maximize2, RotateCcw, AlertTriangle, Shield, Navigation } from 'lucide-react';

const SEVERITY_COLORS = {
  Critical: '#EF4444',
  High: '#F97316',
  Moderate: '#F59E0B',
  Low: '#3B82F6',
  Informational: '#64748B',
};

export default function AlertMap({
  alerts = [],
  selectedAlert = null,
  onSelectAlert = () => {},
  onOpenDossier = () => {},
  onPlanEvacuation = () => {},
  height = '100%',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const roadCorridorGroupRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const riversLayerRef = useRef(null);

  const [layersOpen, setLayersOpen] = useState(false);
  const [showRivers, setShowRivers] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Srikakulam District centroid
    const map = L.map(mapContainerRef.current, {
      center: [18.42, 83.95],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
      minZoom: 8,
      maxZoom: 16,
    });

    // Light CartoDB Voyager or OSM basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Load Boundary GeoJSON
    fetch('/data/srikakulam_boundary.geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !mapInstanceRef.current) return;
        boundaryLayerRef.current = L.geoJSON(data, {
          style: {
            color: '#1E40AF',
            weight: 2,
            opacity: 0.85,
            dashArray: '5, 5',
            fillColor: '#3B82F6',
            fillOpacity: 0.04,
          },
        }).addTo(mapInstanceRef.current);
      })
      .catch((err) => console.warn('Boundary layer note:', err));

    // Load Verified Rivers GeoJSON (Nagavali & Vamsadhara)
    fetch('/data/srikakulam_rivers.geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !mapInstanceRef.current) return;
        riversLayerRef.current = L.geoJSON(data, {
          style: {
            color: '#0284C7',
            weight: 2.5,
            opacity: 0.75,
            lineJoin: 'round',
          },
        }).addTo(mapInstanceRef.current);
      })
      .catch((err) => console.warn('Rivers layer note:', err));

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Toggle boundary visibility
  useEffect(() => {
    if (!boundaryLayerRef.current || !mapInstanceRef.current) return;
    if (showBoundary) {
      if (!mapInstanceRef.current.hasLayer(boundaryLayerRef.current)) {
        boundaryLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(boundaryLayerRef.current)) {
        mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
      }
    }
  }, [showBoundary]);

  // Toggle rivers visibility
  useEffect(() => {
    if (!riversLayerRef.current || !mapInstanceRef.current) return;
    if (showRivers) {
      if (!mapInstanceRef.current.hasLayer(riversLayerRef.current)) {
        riversLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(riversLayerRef.current)) {
        mapInstanceRef.current.removeLayer(riversLayerRef.current);
      }
    }
  }, [showRivers]);

  // Render Alert Markers and Impact Corridors
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean existing markers
    if (markersGroupRef.current) {
      map.removeLayer(markersGroupRef.current);
      markersGroupRef.current = null;
    }
    if (roadCorridorGroupRef.current) {
      map.removeLayer(roadCorridorGroupRef.current);
      roadCorridorGroupRef.current = null;
    }

    const markerGroup = L.featureGroup();
    const corridorGroup = L.featureGroup();

    alerts.forEach((alert) => {
      if (!alert.latitude || !alert.longitude) return;

      const isSelected = selectedAlert && selectedAlert.alert_id === alert.alert_id;
      const isCritical = alert.severity === 'Critical';
      const color = SEVERITY_COLORS[alert.severity] || '#3B82F6';

      // Pulse ring for Critical alerts
      const pulseHtml = isCritical
        ? `<div class="absolute -inset-2 rounded-full bg-red-500 opacity-60 animate-ping"></div>`
        : '';

      const isSimulated = alert.classification === 'SIMULATED';

      const customIcon = L.divIcon({
        className: 'custom-alert-icon',
        html: `
          <div style="position: relative; width: ${isSelected ? '34px' : '26px'}; height: ${isSelected ? '34px' : '26px'}; cursor: pointer;">
            ${pulseHtml}
            <div style="
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${color};
              border: ${isSelected ? '3px solid #FFFFFF' : '2px solid #FFFFFF'};
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-weight: 700;
              font-size: 11px;
            ">
              ${isCritical ? '!' : isSimulated ? 'S' : '▲'}
            </div>
          </div>
        `,
        iconSize: [isSelected ? 34 : 26, isSelected ? 34 : 26],
        iconAnchor: [isSelected ? 17 : 13, isSelected ? 17 : 13],
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon: customIcon });

      // Click handler
      marker.on('click', () => {
        onSelectAlert(alert);
      });

      // Rich popup tooltip
      const popupHtml = `
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; color: #1E293B; width: 230px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
            <span style="background: ${color}20; color: ${color}; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${alert.severity}
            </span>
            <span style="font-size: 10px; color: #64748B; font-weight: 600;">
              ${alert.mandal || 'Srikakulam'}
            </span>
          </div>

          <div style="font-weight: 700; font-size: 13px; color: #0F265C; line-height: 1.25; margin-bottom: 6px;">
            ${alert.title}
          </div>

          ${
            isSimulated
              ? `<div style="font-size: 9px; background: #FEF3C7; color: #92400E; font-weight: 700; padding: 2px 5px; border-radius: 3px; margin-bottom: 6px;">
                  SIMULATED — SCENARIO ONLY
                </div>`
              : ''
          }

          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.35;">
            ${alert.trigger_condition || alert.category}
          </div>

          <div style="border-top: 1px solid #E2E8F0; padding-top: 6px; display: flex; gap: 6px;">
            <button
              id="pop-dossier-${alert.alert_id}"
              style="flex: 1; background: #2563EB; color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 4px 6px; border: none; border-radius: 4px; cursor: pointer;"
            >
              Dossier
            </button>
            ${
              alert.evacuation_route_id || alert.affected_road_segments
                ? `<button
                    id="pop-route-${alert.alert_id}"
                    style="flex: 1; background: #0F265C; color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 4px 6px; border: none; border-radius: 4px; cursor: pointer;"
                  >
                    Route
                  </button>`
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle popup button clicks after DOM renders
      marker.on('popupopen', () => {
        const btnDossier = document.getElementById(`pop-dossier-${alert.alert_id}`);
        if (btnDossier) {
          btnDossier.onclick = (e) => {
            e.stopPropagation();
            onOpenDossier(alert);
          };
        }
        const btnRoute = document.getElementById(`pop-route-${alert.alert_id}`);
        if (btnRoute) {
          btnRoute.onclick = (e) => {
            e.stopPropagation();
            onPlanEvacuation(alert);
          };
        }
      });

      markerGroup.addLayer(marker);

      // Draw road / corridor hazard if present and enabled
      if (showCorridors && (alert.affected_road_segments || alert.category === 'Road Closure Alert')) {
        // Draw indicative affected road span
        const offsetLat = 0.012;
        const offsetLon = 0.015;
        const poly = L.polyline(
          [
            [alert.latitude - offsetLat, alert.longitude - offsetLon],
            [alert.latitude, alert.longitude],
            [alert.latitude + offsetLat, alert.longitude + offsetLon],
          ],
          {
            color: '#DC2626',
            weight: 4,
            opacity: 0.8,
            dashArray: '6, 6',
          }
        );
        poly.bindTooltip(`Affected Corridor: ${alert.affected_road_segments || 'Hazard Zone'}`, {
          sticky: true,
        });
        corridorGroup.addLayer(poly);
      }
    });

    markerGroup.addTo(map);
    markersGroupRef.current = markerGroup;

    if (showCorridors) {
      corridorGroup.addTo(map);
      roadCorridorGroupRef.current = corridorGroup;
    }
  }, [alerts, selectedAlert, showCorridors]);

  // Center on selected alert when changed
  useEffect(() => {
    if (!selectedAlert || !mapInstanceRef.current) return;
    if (selectedAlert.latitude && selectedAlert.longitude) {
      mapInstanceRef.current.setView(
        [selectedAlert.latitude, selectedAlert.longitude],
        12,
        { animate: true, duration: 0.6 }
      );
    }
  }, [selectedAlert]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([18.42, 83.95], 9, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 rounded-xl overflow-hidden border border-[#DCE6F5] shadow-xs flex flex-col">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
          <span className="text-xs font-bold text-[#0F265C]">Srikakulam Alert GIS</span>
          <span className="text-[11px] text-slate-500 font-medium">({alerts.length} active)</span>
        </div>
      </div>

      {/* Layer Control Toggle Button */}
      <div className="absolute top-3 right-12 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            title="Layer controls"
          >
            <Layers size={15} />
          </button>

          {layersOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-lg border border-slate-200 p-2.5 z-50 text-xs text-slate-700">
              <div className="font-bold text-[#0F265C] mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>GIS Overlay Layers</span>
                <span className="text-[10px] text-slate-400 font-normal">Srikakulam</span>
              </div>
              <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-50 px-1 rounded">
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={(e) => setShowBoundary(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>District AOI Boundary</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-50 px-1 rounded">
                <input
                  type="checkbox"
                  checked={showRivers}
                  onChange={(e) => setShowRivers(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Nagavali & Vamsadhara</span>
              </label>
              <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-50 px-1 rounded">
                <input
                  type="checkbox"
                  checked={showCorridors}
                  onChange={(e) => setShowCorridors(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Affected Road Corridors</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Reset View Button */}
      <div className="absolute top-12 right-12 z-[1000] mt-1">
        <button
          onClick={resetView}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
          title="Reset map view"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[340px]" />

      {/* Compact Bottom Legend */}
      <div className="w-full bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 z-[999]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">Severity:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Low</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-slate-400">Classifications:</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[10px]">Official</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[10px]">Observed</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium text-[10px]">Model</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">Simulated</span>
        </div>
      </div>
    </div>
  );
}

