import { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * RouteLayer component for Leaflet DigitalTwinMap
 * Renders verified A* and Dijkstra graph-based evacuation paths and waypoints.
 * Strictly renders surveyed road network coordinates without synthetic fallbacks.
 */
export default function RouteLayer({
  map,
  visible = true,
  activeRoute = null,
  alternativeRoute = null,
  origin = null,
  destination = null,
  selectedRouteType = 'primary',
  onSelectRoute = null,
  onSelectFeature = null,
  simulationMode = false,
}) {
  const layerGroupRef = useRef(null);
  const lastFittedSignatureRef = useRef('');

  useEffect(() => {
    if (!map) return;

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const group = layerGroupRef.current;
    group.clearLayers();

    if (!visible) return;

    // 1. Origin Marker
    if (origin && origin.lat && origin.lon) {
      const originIcon = L.divIcon({
        className: 'origin-marker-icon',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:26px; height:26px; border-radius:50%; background:rgba(37,99,235,0.25); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:14px; height:14px; border-radius:50%; background:#2563EB; border:2.5px solid #FFFFFF; box-shadow:0 2px 6px rgba(37,99,235,0.4);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const originMarker = L.marker([origin.lat, origin.lon], { icon: originIcon, zIndexOffset: 900 });
      originMarker.bindTooltip(`
        <div style="background:#FFFFFF; color:#0F265C; padding:6px 10px; border-radius:6px; border:1px solid #DCE6F5; box-shadow:0 2px 8px rgba(15,38,92,0.1); font-size:11px;">
          <b style="color:#2563EB;">EVACUATION ORIGIN</b><br/>
          <span style="color:#475569;">${origin.name || 'Current Staging Point'}</span>
        </div>
      `, { direction: 'top' });
      originMarker.addTo(group);
    }

    // 2. Destination Marker
    if (destination && destination.lat && destination.lon) {
      const destIcon = L.divIcon({
        className: 'dest-marker-icon',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <div style="width:16px; height:16px; border-radius:4px; background:#10B981; border:2.5px solid #FFFFFF; box-shadow:0 2px 6px rgba(16,185,129,0.4);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const destMarker = L.marker([destination.lat, destination.lon], { icon: destIcon, zIndexOffset: 900 });
      destMarker.bindTooltip(`
        <div style="background:#FFFFFF; color:#0F265C; padding:6px 10px; border-radius:6px; border:1px solid #DCE6F5; box-shadow:0 2px 8px rgba(15,38,92,0.1); font-size:11px;">
          <b style="color:#10B981;">EVACUATION DESTINATION</b><br/>
          <span style="color:#475569;">${destination.name || 'Designated Shelter'}</span>
        </div>
      `, { direction: 'top' });
      destMarker.addTo(group);
    }

    // Coordinate normalizer: GeoJSON [lon, lat] -> Leaflet [lat, lon]
    const extractLeafletCoords = (route) => {
      if (!route) return null;
      const raw = route.coordinates || route.geometry?.coordinates;
      if (!raw || !Array.isArray(raw) || raw.length === 0) return null;
      return raw.map(c => {
        if (!Array.isArray(c) || c.length < 2) return c;
        if (c[0] > 50.0 && c[1] < 40.0) {
          return [c[1], c[0]]; // Swap [lon, lat] -> [lat, lon]
        }
        return [c[0], c[1]];
      });
    };

    // 3. Alternative route corridor
    const altCoords = extractLeafletCoords(alternativeRoute);
    if (altCoords && altCoords.length > 0) {
      const isSelected = selectedRouteType === 'alternative';
      const altLine = L.polyline(altCoords, {
        color: isSelected ? '#D97706' : '#94A3B8',
        weight: isSelected ? 4.5 : 3,
        opacity: isSelected ? 0.95 : 0.7,
        dashArray: '6, 8',
      });

      altLine.on('click', () => {
        if (onSelectRoute) onSelectRoute('alternative');
        if (onSelectFeature) {
          onSelectFeature({
            type: 'ROUTE',
            title: 'Alternative Evacuation Route',
            status: 'Model-derived',
            source: `${alternativeRoute.algorithm || 'Surveyed-road'} alternate corridor`,
            metrics: [
              { label: 'Algorithm', value: alternativeRoute.algorithm || 'Unknown' },
              { label: 'Total Distance', value: `${alternativeRoute.distance_km ?? alternativeRoute.distanceKm ?? '—'} km` },
              { label: 'Estimated Travel Time', value: `${alternativeRoute.estimated_time_mins ?? alternativeRoute.etaMin ?? '—'} mins` },
              { label: 'Mapped Flood Exposure', value: alternativeRoute.hazard_exposure || alternativeRoute.floodRiskStatus || 'Unknown' },
            ],
          });
        }
      });

      altLine.bindTooltip(`
        <div style="background:#FFFFFF; color:#0F265C; padding:6px 10px; border-radius:6px; border:1px solid #DCE6F5; box-shadow:0 2px 8px rgba(15,38,92,0.1); font-size:11px;">
          <b style="color:#D97706;">ALTERNATIVE ROUTE</b><br/>
          <span style="color:#475569;">Distance: ${alternativeRoute.distance_km ?? alternativeRoute.distanceKm ?? '—'} km | ETA: ${alternativeRoute.estimated_time_mins ?? alternativeRoute.etaMin ?? '—'} min</span>
        </div>
      `, { sticky: true });
      altLine.addTo(group);
    }

    // 4. Primary route - only render authentic surveyed road coordinates
    const primaryCoords = extractLeafletCoords(activeRoute);

    if (primaryCoords && primaryCoords.length > 0) {
      const isSelected = selectedRouteType === 'primary';
      const algoName = activeRoute?.algorithm || 'A*';

      // Auto-fit map to route bounds strictly ONCE when route endpoints or identity change
      const routeSig = `${activeRoute?.route_id || ''}_${primaryCoords.length}_${origin?.lat || ''}_${destination?.lat || ''}`;
      if (primaryCoords.length > 1 && map && !simulationMode && lastFittedSignatureRef.current !== routeSig) {
        lastFittedSignatureRef.current = routeSig;
        try {
          const bounds = L.latLngBounds(primaryCoords);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
        } catch (_) {}
      }

      // Outer halo
      const haloLine = L.polyline(primaryCoords, {
        color: '#2563EB',
        weight: isSelected ? 8 : 6,
        opacity: isSelected ? 0.3 : 0.18,
        lineCap: 'round',
        lineJoin: 'round',
      });
      haloLine.addTo(group);

      // Core line
      const mainLine = L.polyline(primaryCoords, {
        color: '#2563EB',
        weight: isSelected ? 4.5 : 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      mainLine.on('click', () => {
        if (onSelectRoute) onSelectRoute('primary');
        if (onSelectFeature) {
          onSelectFeature({
            type: 'ROUTE',
            title: 'Primary Surveyed-Road Route',
            status: 'Model-derived',
            source: `Surveyed-road routing (${algoName} Algorithm)`,
            metrics: [
              { label: 'Algorithm', value: `${algoName} Routing` },
              { label: 'Total Distance', value: `${activeRoute?.distanceKm ?? activeRoute?.distance_km ?? '—'} km` },
              { label: 'Estimated Travel Time', value: `${activeRoute?.etaMin ?? activeRoute?.estimated_time_mins ?? '—'} mins` },
              { label: 'Mapped Flood Exposure', value: activeRoute?.hazard_exposure || 'Unknown' },
            ],
          });
        }
      });

      mainLine.bindTooltip(`
        <div style="background:#FFFFFF; color:#0F265C; padding:6px 10px; border-radius:6px; border:1px solid #DCE6F5; box-shadow:0 2px 8px rgba(15,38,92,0.1); font-size:11px;">
          <b style="color:#2563EB;">PRIMARY CORRIDOR (${algoName.toUpperCase()})</b><br/>
          <span style="color:#475569;">Distance: ${activeRoute?.distanceKm ?? activeRoute?.distance_km ?? '—'} km | ETA: ${activeRoute?.etaMin ?? activeRoute?.estimated_time_mins ?? '—'} min</span><br/>
          <span style="font-weight:600;">Mapped Flood Exposure: ${activeRoute?.hazard_exposure || 'Unknown'}</span>
        </div>
      `, { sticky: true });
      mainLine.addTo(group);
    }

    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
      }
    };
  }, [map, visible, activeRoute, alternativeRoute, origin, destination, selectedRouteType, onSelectRoute, onSelectFeature]);

  return null;
}
