import { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * FloodLayer component for Leaflet DigitalTwinMap
 * Renders verified Sentinel-1 SAR + Hydro-DEM multi-mechanism flood inundation zones.
 * Supports:
 * - Direct rendering of simulated GeoJSON from backend scenario simulation
 * - Independent layer toggling (Extent, Depth Gradient, Severity Categories)
 * - Safe basemap transparency ensuring roads, rivers, and place labels remain visible
 */
export default function FloodLayer({
  map,
  visible = true,
  customGeoJson = null,
  showDepth = false,
  showSeverity = false,
  simulationWaterLevel = 0,
  selectedFeature = null,
  onSelectFeature = null,
  onStatusChange = null,
}) {
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const group = layerGroupRef.current;
    group.clearLayers();

    if (!visible) {
      if (onStatusChange) onStatusChange({ loaded: true, count: 0, visible: false });
      return;
    }

    const renderGeoJson = (geojsonData) => {
      let featureCount = 0;
      const floodGeoJson = L.geoJSON(geojsonData, {
        style: (feature) => {
          const props = feature.properties || {};
          const isSelected = Boolean(
            selectedFeature &&
            selectedFeature.properties?.id &&
            props.id &&
            selectedFeature.properties.id === props.id
          );
          const severity = props.simulated_severity || props.severity || 'MODERATE';
          const depth = (props.simulated_depth_m ?? props.depth_m ?? 1.2) + simulationWaterLevel;
          const mechanism = props.flood_mechanism || 'RIVERINE';

          // Color & Styling determination
          let fillColor = '#0284C7';
          let strokeColor = '#0369A1';
          let fillOpacity = 0.35;
          let strokeWidth = 1.2;

          if (showSeverity) {
            // Severity mode: Red / Dark Orange / Amber
            if (severity === 'CRITICAL' || depth > 2.0) {
              fillColor = '#DC2626';
              strokeColor = '#B91C1C';
              fillOpacity = 0.45;
              strokeWidth = 1.6;
            } else if (severity === 'HIGH' || depth > 1.2) {
              fillColor = '#EA580C';
              strokeColor = '#C2410C';
              fillOpacity = 0.38;
              strokeWidth = 1.4;
            } else {
              fillColor = '#F59E0B';
              strokeColor = '#D97706';
              fillOpacity = 0.30;
              strokeWidth = 1.0;
            }
          } else if (showDepth) {
            // Depth mode: Depth Gradient
            if (depth > 2.0) {
              fillColor = '#1E3A8A'; // Deep Navy
              strokeColor = '#1E40AF';
              fillOpacity = 0.52;
              strokeWidth = 1.6;
            } else if (depth > 1.2) {
              fillColor = '#0284C7'; // Vivid Cyan-Blue
              strokeColor = '#0369A1';
              fillOpacity = 0.40;
              strokeWidth = 1.3;
            } else {
              fillColor = '#38BDF8'; // Sky Blue
              strokeColor = '#0284C7';
              fillOpacity = 0.28;
              strokeWidth = 1.0;
            }
          } else {
            // Default Inundation Extent mode: Clean translucent blue-cyan
            // Ensures basemap, roads and deep blue river paths remain clearly visible
            fillColor = '#0284C7';
            strokeColor = '#0369A1';
            fillOpacity = 0.35;
            strokeWidth = 1.2;
          }

          if (isSelected) {
            strokeColor = '#2563EB';
            fillColor = '#3B82F6';
            fillOpacity = 0.60;
            strokeWidth = 2.8;
          }

          return {
            stroke: true,
            color: strokeColor,
            weight: strokeWidth,
            opacity: isSelected ? 1.0 : 0.85,
            fillColor,
            fillOpacity,
            className: 'flood-vector-poly',
          };
        },
        onEachFeature: (feature, layer) => {
          featureCount++;
          const props = feature.properties || {};
          const depth = ((props.simulated_depth_m ?? props.depth_m ?? 1.2) + simulationWaterLevel).toFixed(2);
          const severity = props.simulated_severity || props.severity || 'MODERATE';
          const mechanism = props.flood_mechanism || 'RIVERINE';
          const zoneName = props.flood_type || 'Simulated Flood Inundation Zone';
          const nearestRiver = props.nearest_river || props.associated_waterway || 'Srikakulam River Basin';
          const distKm = props.verified_distance_to_river_km ?? props.distance_to_waterway_km ?? 0.25;
          const elevation = props.elevation_m ?? 12.0;

          const severityBadge =
            severity === 'CRITICAL'
              ? 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;'
              : severity === 'HIGH'
              ? 'background:#FFF7ED; color:#EA580C; border:1px solid #FED7AA;'
              : severity === 'MODERATE'
              ? 'background:#FEFCE8; color:#D97706; border:1px solid #FEF08A;'
              : 'background:#EFF6FF; color:#0284C7; border:1px solid #BFDBFE;';

          const tooltipContent = `
            <div style="background:#FFFFFF; color:#0F265C; padding:9px 12px; border-radius:8px; font-family:Inter, sans-serif; font-size:11px; border:1px solid #DCE7F6; box-shadow:0 4px 14px rgba(15,38,92,0.12); min-width:210px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #F1F5F9; padding-bottom:4px;">
                <span style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; font-weight:700; font-size:8.5px; padding:1px 6px; border-radius:4px; text-transform:uppercase;">${mechanism.replace('_', ' ')}</span>
                <span style="${severityBadge} font-weight:700; font-size:9px; padding:1px 6px; border-radius:4px;">${severity}</span>
              </div>
              <div style="font-weight:700; color:#0F265C; font-size:12px; margin-bottom:5px; line-height:1.2;">${zoneName}</div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:3px 8px; margin-bottom:4px;">
                <div style="color:#64748B; font-size:10px;">Water Depth: <strong style="color:#0F265C;">${depth} m</strong></div>
                <div style="color:#64748B; font-size:10px;">Elevation: <strong style="color:#0F265C;">${elevation} m</strong></div>
                <div style="color:#64748B; font-size:10px;">Nearest River: <strong style="color:#1D4ED8;">${nearestRiver.replace(' River', '')}</strong></div>
                <div style="color:#64748B; font-size:10px;">Proximity: <strong style="color:#10B981;">${distKm} km</strong></div>
              </div>
              <div style="color:#64748B; font-size:9.5px; border-top:1px dashed #E2E8F0; padding-top:4px; display:flex; justify-content:space-between;">
                <span>DEM Model: <strong>Copernicus GLO-30</strong></span>
                <span style="color:#10B981; font-weight:600;">Status: SIMULATED</span>
              </div>
            </div>
          `;

          layer.bindTooltip(tooltipContent, {
            direction: 'top',
            className: 'light-tooltip',
            sticky: true,
          });

          layer.on('click', () => {
            if (onSelectFeature) {
              onSelectFeature({
                type: 'FLOOD_ZONE',
                title: zoneName,
                status: 'SIMULATED_INUNDATION',
                source: 'Copernicus Sentinel-1 SAR + Hydro-DEM Scenario Simulation',
                properties: props,
                metrics: [
                  { label: 'Water Depth', value: `${depth} m` },
                  { label: 'Terrain Elevation', value: `${elevation} m` },
                  { label: 'River Proximity', value: `${distKm} km` },
                  { label: 'Inundation Severity', value: severity },
                  { label: 'Nearest River', value: nearestRiver },
                  { label: 'Flood Mechanism', value: mechanism },
                ],
              });
            }
          });
        },
      });

      group.addLayer(floodGeoJson);
      if (onStatusChange) onStatusChange({ loaded: true, count: featureCount, visible: true });
    };

    if (customGeoJson && customGeoJson.features) {
      renderGeoJson(customGeoJson);
    } else {
      if (onStatusChange) onStatusChange({ loading: true, error: null });
      fetch('/data/srikakulam_flood_inundation.geojson')
        .then((res) => {
          if (!res.ok) throw new Error('Flood GeoJSON unavailable');
          return res.json();
        })
        .then((geojsonData) => {
          renderGeoJson(geojsonData);
        })
        .catch((err) => {
          console.warn('Flood GeoJSON fetch notice:', err);
          if (onStatusChange) onStatusChange({ loaded: false, error: err.message, visible: false });
        });
    }

    return () => {
      if (group) group.clearLayers();
    };
  }, [map, visible, customGeoJson, showDepth, showSeverity, simulationWaterLevel, selectedFeature]);

  return null;
}
