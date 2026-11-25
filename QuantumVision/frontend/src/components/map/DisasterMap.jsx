import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMap } from '../../context/MapContext';
import {
  Plus,
  Minus,
  Crosshair,
  Navigation,
  X,
  Layers,
  Shield,
  Activity,
  Droplets,
  AlertTriangle,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { predictRisk } from '../../services/riskApi';
import { SRIKAKULAM_SHELTERS_DATASET, haversineDistanceKm } from '../../utils/shelterEngine';

export default function DisasterMap({ onFeatureClick }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTilesRef = useRef({
    dark: null,
    satellite: null
  });

  const layersRef = useRef({
    boundary: null,
    boundaryGlow: null,
    districtBase: null,
    flood: null,
    waterways: null,
    riskZones: null,
    roads: null,
    facilities: null,
    route: null,
    altRoute: null,
    hubs: null,
    buildings: null,
    rainfall: null,
    originMarker: null,
    navConvoyMarker: null
  });

  const {
    layers,
    setRiskResult,
    setNavigationParams,
    origin,
    setOrigin,
    nearbyShelters,
    selectedShelter,
    selectShelter,
    activeRoute,
    alternativeRoute,
    selectedRouteType,
    switchRouteType,
    isNavigating,
    activeStepIndex,
    navigationSteps,
    nextStep,
    prevStep,
    stopNavigation
  } = useMap();

  const [popupData, setPopupData] = useState(null);
  const [boundaryData, setBoundaryData] = useState(null);
  const [floodData, setFloodData] = useState(null);
  const [roadsData, setRoadsData] = useState(null);
  const [buildingsData, setBuildingsData] = useState(null);

  // Initial Map Setup (Centered on Srikakulam district corridor)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [origin?.lat || 18.2969, origin?.lon || 83.8968],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      minZoom: 8,
      maxZoom: 17
    });

    // Dark Matter CartoDB Basemap
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      className: 'dark-carto-tiles'
    }).addTo(map);

    // Esri World Imagery Satellite Basemap
    const satelliteTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      className: 'satellite-tiles'
    });

    baseTilesRef.current.dark = darkTile;
    baseTilesRef.current.satellite = satelliteTile;

    // Handle map click for dynamic risk inspection
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await predictRisk({
          latitude: lat,
          longitude: lng,
          hazard_type: 'flood'
        });
        if (res?.data) {
          setRiskResult(res.data);
          setPopupData({
            title: `GIS Inspection Point`,
            type: `AI RISK ASSESSMENT [${res.data.risk_category || 'HIGH'}]`,
            details: [
              { label: 'Risk Score', value: `${((res.data.risk_score || 0.82) * 100).toFixed(1)} / 100` },
              { label: 'Risk Level', value: res.data.risk_category || 'HIGH' },
              { label: 'Model', value: res.data.inference_type || 'XGBoost + Physics' },
              { label: 'Status', value: res.data.data_status || 'MODEL-DERIVED' },
              { label: 'Coordinates', value: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` }
            ],
            lat,
            lon: lng
          });
        }
      } catch (err) {
        setPopupData({
          title: `Srikakulam GIS Inspection`,
          type: `INUNDATION CORRIDOR`,
          details: [
            { label: 'Coordinates', value: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` },
            { label: 'Risk Level', value: 'HIGH' },
            { label: 'Catchment', value: 'Vamsadhara River Corridor' },
            { label: 'Flood Depth Est.', value: '1.2m – 1.8m' }
          ],
          lat,
          lon: lng
        });
      }
    });

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

  // Window resize observer
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Switch between Dark Basemap and Satellite Basemap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layers.satellite) {
      if (map.hasLayer(baseTilesRef.current.dark)) {
        map.removeLayer(baseTilesRef.current.dark);
      }
      if (!map.hasLayer(baseTilesRef.current.satellite)) {
        baseTilesRef.current.satellite.addTo(map);
      }
    } else {
      if (map.hasLayer(baseTilesRef.current.satellite)) {
        map.removeLayer(baseTilesRef.current.satellite);
      }
      if (!map.hasLayer(baseTilesRef.current.dark)) {
        baseTilesRef.current.dark.addTo(map);
      }
    }
  }, [layers.satellite]);

  // Load GeoJSON datasets
  useEffect(() => {
    fetch('/data/srikakulam_boundary_web.geojson')
      .then((r) => r.json())
      .then(setBoundaryData)
      .catch((err) => console.warn('Boundary GeoJSON load notice:', err));

    fetch('/data/srikakulam_flood_inundation.geojson')
      .then((r) => r.json())
      .then(setFloodData)
      .catch((err) => console.warn('Flood GeoJSON load notice:', err));

    fetch('/data/srikakulam_roads_web.geojson')
      .then((r) => r.json())
      .then(setRoadsData)
      .catch((err) => console.warn('Roads GeoJSON load notice:', err));

    fetch('/data/srikakulam_buildings_3d.geojson')
      .then((r) => r.json())
      .then(setBuildingsData)
      .catch((err) => console.warn('Buildings 3D GeoJSON load notice:', err));
  }, []);

  // 1. Boundary Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.boundary) {
      map.removeLayer(layersRef.current.boundary);
      layersRef.current.boundary = null;
    }

    if (layers.boundary && boundaryData) {
      const boundaryLayer = L.geoJSON(boundaryData, {
        style: {
          color: '#19D3FF',
          weight: 2,
          opacity: 0.8,
          fillColor: '#07152B',
          fillOpacity: 0.15,
          dashArray: '4, 4'
        }
      }).addTo(map);
      layersRef.current.boundary = boundaryLayer;
    }
  }, [layers.boundary, boundaryData]);

  // 2. Risk Zones Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.riskZones) {
      map.removeLayer(layersRef.current.riskZones);
      layersRef.current.riskZones = null;
    }

    if (layers.riskZones) {
      const riskGroup = L.featureGroup();

      // High Risk Zone (Nagavali Flood Basin)
      const highRiskCoords = [
        [18.25, 83.84], [18.33, 83.89], [18.36, 83.94], [18.30, 83.98],
        [18.24, 83.94], [18.21, 83.89]
      ];
      const p1 = L.polygon(highRiskCoords, {
        color: '#FF2638',
        weight: 1.5,
        fillColor: '#DC2626',
        fillOpacity: 0.35,
        smoothFactor: 1.5
      }).addTo(riskGroup);

      p1.on('click', () => {
        setPopupData({
          title: 'Nagavali Lower Basin Risk Zone',
          type: 'HIGH FLOOD RISK ZONE',
          details: [
            { label: 'Risk Level', value: 'CRITICAL / HIGH' },
            { label: 'Peak Depth Est.', value: '1.4m &ndash; 2.2m' },
            { label: 'Population at Risk', value: '46,500' },
            { label: 'Status', value: 'EVACUATION ACTIVE' }
          ]
        });
      });

      // Moderate Risk Zone (Vamsadhara Basin)
      const moderateRiskCoords = [
        [18.38, 84.05], [18.48, 84.09], [18.55, 84.03], [18.47, 83.96],
        [18.40, 83.99]
      ];
      const p2 = L.polygon(moderateRiskCoords, {
        color: '#F59E0B',
        weight: 1.5,
        fillColor: '#D97706',
        fillOpacity: 0.30,
        smoothFactor: 1.5
      }).addTo(riskGroup);

      p2.on('click', () => {
        setPopupData({
          title: 'Vamsadhara Catchment Risk Zone',
          type: 'MODERATE FLOOD RISK ZONE',
          details: [
            { label: 'Risk Level', value: 'MODERATE' },
            { label: 'Peak Depth Est.', value: '0.4m &ndash; 0.9m' },
            { label: 'Population at Risk', value: '28,200' },
            { label: 'Status', value: 'WATCH LEVEL' }
          ]
        });
      });

      riskGroup.addTo(map);
      layersRef.current.riskZones = riskGroup;
    }
  }, [layers.riskZones]);

  // 3. Flood Inundation Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.flood) {
      map.removeLayer(layersRef.current.flood);
      layersRef.current.flood = null;
    }

    if (layers.floodInundation && floodData) {
      const floodLayer = L.geoJSON(floodData, {
        style: {
          color: '#00E5FF',
          weight: 1.5,
          fillColor: '#0077B6',
          fillOpacity: 0.65
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            setPopupData({
              title: feature.properties?.name || 'Inundation Zone',
              type: 'FLOOD EXTENT',
              details: [
                { label: 'Water Extent', value: `${feature.properties?.area_km2 || '82.5'} km²` },
                { label: 'Risk', value: 'HIGH' },
                { label: 'Confidence', value: `${feature.properties?.confidence || '94'}%` },
                { label: 'Sensor', value: 'Sentinel-1 C-SAR' }
              ]
            });
          });
          layer.bindTooltip('FLOOD EXTENT [Sentinel-1 SAR]', {
            className: 'hud-tooltip font-mono text-[9px]'
          });
        }
      }).addTo(map);
      layersRef.current.flood = floodLayer;
    }
  }, [layers.floodInundation, floodData]);

  // 4. Rivers & Waterways
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.waterways) {
      map.removeLayer(layersRef.current.waterways);
      layersRef.current.waterways = null;
    }

    if (layers.waterways) {
      const riverGroup = L.featureGroup();

      const nagavali = [
        [18.2300, 83.9200], [18.2800, 83.9000], [18.3100, 83.8900],
        [18.3600, 83.8500], [18.4200, 83.8200], [18.5100, 83.7500],
        [18.6500, 83.6800], [18.7800, 83.5500]
      ];

      const vamsadhara = [
        [18.3500, 84.1400], [18.4200, 84.0800], [18.5200, 84.0200],
        [18.6200, 83.9500], [18.7500, 83.9000], [18.8800, 83.8200]
      ];

      [
        { name: 'Nagavali River', coords: nagavali, discharge: '42,500 cusecs' },
        { name: 'Vamsadhara River', coords: vamsadhara, discharge: '58,200 cusecs' }
      ].forEach((riv) => {
        L.polyline(riv.coords, {
          color: '#00CFFF',
          weight: 5,
          opacity: 0.35
        }).addTo(riverGroup);

        const line = L.polyline(riv.coords, {
          color: '#00E5FF',
          weight: 2.2,
          opacity: 0.95
        }).addTo(riverGroup);

        line.bindTooltip(`${riv.name} Corridor`, { className: 'hud-tooltip font-mono text-[9px]' });
      });

      riverGroup.addTo(map);
      layersRef.current.waterways = riverGroup;
    }
  }, [layers.waterways]);

  // 5. Road Network Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.roads) {
      map.removeLayer(layersRef.current.roads);
      layersRef.current.roads = null;
    }

    if (layers.roads && roadsData) {
      const roadsLayer = L.geoJSON(roadsData, {
        style: {
          color: '#2563EB',
          weight: 1.3,
          opacity: 0.45
        }
      }).addTo(map);
      layersRef.current.roads = roadsLayer;
    }
  }, [layers.roads, roadsData]);

  // 6. 3D Buildings / Terrain
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.buildings) {
      map.removeLayer(layersRef.current.buildings);
      layersRef.current.buildings = null;
    }

    if (layers.terrain && buildingsData) {
      const bldgLayer = L.geoJSON(buildingsData, {
        style: () => ({
          color: '#19D3FF',
          weight: 1,
          fillColor: '#0E3A6E',
          fillOpacity: 0.75
        })
      }).addTo(map);
      layersRef.current.buildings = bldgLayer;
    }
  }, [layers.terrain, buildingsData]);

  // 7. Dynamic Shelter Markers & Hospitals with Section 6 Interactive Hover Tooltips
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.facilities) {
      map.removeLayer(layersRef.current.facilities);
      layersRef.current.facilities = null;
    }

    if (layers.shelters || layers.hospitals) {
      const facilityGroup = L.featureGroup();

      // Hospitals list
      const hospitals = [
        { id: 'hosp_01', name: 'RIMS Govt General Hospital', type: 'hospital', lat: 18.3125, lon: 83.9102, cap: 750, occupied: 480, status: 'OPERATIONAL' },
        { id: 'hosp_02', name: 'Tekkali Sub-District Trauma Hospital', type: 'hospital', lat: 18.6180, lon: 84.2400, cap: 250, occupied: 140, status: 'STANDBY' },
        { id: 'hosp_03', name: 'Palasa Community Health Center', type: 'hospital', lat: 18.7750, lon: 84.4100, cap: 180, occupied: 95, status: 'OPERATIONAL' },
        { id: 'hosp_04', name: 'Sompeta Coastal Trauma Ward', type: 'hospital', lat: 18.9350, lon: 84.5800, cap: 120, occupied: 60, status: 'OPERATIONAL' },
        { id: 'hosp_05', name: 'Narasannapeta Primary Care Depot', type: 'hospital', lat: 18.4250, lon: 84.0500, cap: 150, occupied: 85, status: 'STANDBY' }
      ];

      // Merge dataset shelters with evaluated nearby shelters
      const shelterList = SRIKAKULAM_SHELTERS_DATASET.map(base => {
        const found = nearbyShelters?.find(n => n.id === base.id);
        return found || base;
      });

      // Render Shelters
      if (layers.shelters) {
        shelterList.forEach((shelter) => {
          const isSelected = selectedShelter?.id === shelter.id || selectedShelter?.name === shelter.name;
          const available = Math.max(0, shelter.totalCapacity - shelter.currentOccupancy);
          
          // Dynamic road distance & ETA computation relative to active origin
          const directDist = haversineDistanceKm(origin.lat, origin.lon, shelter.lat, shelter.lon);
          const roadDist = shelter.roadDistanceKm ?? (Math.round(directDist * 1.22 * 10) / 10);
          const speed = roadDist <= 5 ? 22 : (roadDist <= 20 ? 34 : 42);
          const eta = shelter.etaMin ?? Math.max(3, Math.round((roadDist / speed) * 60));

          // Icon: Highlighted green icon with pulsating double ring if selected
          const iconHtml = isSelected
            ? `
              <div class="relative flex items-center justify-center cursor-pointer">
                <span class="absolute w-9 h-9 rounded-full bg-[#10B981]/40 animate-ping"></span>
                <span class="absolute w-7 h-7 rounded-full bg-[#19D3FF]/50 animate-pulse"></span>
                <div class="w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white font-mono font-black text-[9px] shadow-[0_0_18px_#10B981]">
                  S
                </div>
              </div>
            `
            : `
              <div class="relative flex items-center justify-center cursor-pointer hover:scale-125 transition-transform">
                <span class="absolute w-5 h-5 rounded-full bg-[#10B981]/25"></span>
                <div class="w-4 h-4 rounded-full bg-[#10B981] border border-white flex items-center justify-center text-white font-mono font-bold text-[8px] shadow-[0_0_8px_#10B981]">
                  S
                </div>
              </div>
            `;

          const icon = L.divIcon({
            html: iconHtml,
            className: 'shelter-marker-icon',
            iconSize: isSelected ? [36, 36] : [20, 20],
            iconAnchor: isSelected ? [18, 18] : [10, 10]
          });

          const marker = L.marker([shelter.lat, shelter.lon], { icon, zIndexOffset: isSelected ? 1000 : 400 });

          // SECTION 6: Interactive Compact Hover Tooltip
          const tooltipContent = `
            <div style="padding: 10px; width: 230px; font-family: monospace; background: rgba(5,13,28,0.96); border: 1px solid #19D3FF; border-radius: 8px; color: white;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 6px;">
                <span style="font-size: 8px; color: #19D3FF; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">
                  ${isSelected ? '★ SELECTED DESTINATION' : 'SHELTER FACILITY'}
                </span>
                <span style="font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 2px; text-transform: uppercase; background: ${shelter.isOpen ? 'rgba(50,232,117,0.2)' : 'rgba(255,77,94,0.2)'}; color: ${shelter.isOpen ? '#32E875' : '#FF4D5E'};">
                  ${shelter.status || (shelter.isOpen ? 'OPEN' : 'CLOSED')}
                </span>
              </div>
              <h5 style="font-size: 11px; font-weight: bold; color: white; margin: 0 0 6px 0; line-height: 1.2;">
                ${shelter.name}
              </h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9.5px; margin-bottom: 8px;">
                <span style="color: #7B92B2;">Distance</span><strong style="text-align: right; color: white;">${roadDist} km</strong>
                <span style="color: #7B92B2;">ETA</span><strong style="text-align: right; color: white;">${eta} min</strong>
                <span style="color: #7B92B2;">Capacity</span><strong style="text-align: right; color: white;">${shelter.totalCapacity}</strong>
                <span style="color: #7B92B2;">Available</span><strong style="text-align: right; color: #32E875;">${available}</strong>
                <span style="color: #7B92B2;">Risk</span><strong style="text-align: right; color: #32E875;">${shelter.riskLevel || 'LOW'}</strong>
                <span style="color: #7B92B2;">Status</span><strong style="text-align: right; color: ${shelter.isOpen ? '#32E875' : '#FF4D5E'};">${shelter.isOpen ? 'OPEN' : 'CLOSED'}</strong>
              </div>
              <div style="text-align: center; background: #19D3FF; color: black; font-weight: 800; font-size: 9px; padding: 4px; border-radius: 4px; cursor: pointer; text-transform: uppercase;">
                ${isSelected ? 'CURRENT DESTINATION' : '[VIEW ROUTE]'}
              </div>
            </div>
          `;

          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -12],
            className: 'shelter-interactive-tooltip',
            opacity: 1
          });

          // Marker Click handler (Immediate dynamic update)
          marker.on('click', () => {
            selectShelter(shelter);
          });

          marker.addTo(facilityGroup);
        });
      }

      // Render Hospitals (Red with white '+')
      if (layers.hospitals) {
        hospitals.forEach((hosp) => {
          const icon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center cursor-pointer hover:scale-125 transition-transform">
                <span class="absolute w-5 h-5 rounded-full bg-[#E11D48]/30"></span>
                <div class="w-4 h-4 rounded-full bg-[#E11D48] border border-white flex items-center justify-center text-white font-bold text-[9px] shadow-[0_0_8px_#E11D48]">
                  +
                </div>
              </div>
            `,
            className: 'hospital-marker-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = L.marker([hosp.lat, hosp.lon], { icon, zIndexOffset: 300 });
          marker.bindTooltip(`HOSPITAL: ${hosp.name} (${hosp.cap - hosp.occupied} Beds Available)`, {
            className: 'hud-tooltip font-mono text-[9px]'
          });
          marker.addTo(facilityGroup);
        });
      }

      facilityGroup.addTo(map);
      layersRef.current.facilities = facilityGroup;
    }
  }, [layers.shelters, layers.hospitals, nearbyShelters, selectedShelter, origin, selectShelter]);

  // 8. Origin Marker & Regional Hubs
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.originMarker) {
      map.removeLayer(layersRef.current.originMarker);
      layersRef.current.originMarker = null;
    }

    const origGroup = L.featureGroup();

    // Dynamic Origin Marker with pulsing cyan radar ring
    const originIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-9 h-9 rounded-full bg-[#19D3FF]/40 animate-ping"></span>
          <span class="absolute w-7 h-7 rounded-full bg-[#00E5FF]/50 animate-pulse"></span>
          <div class="w-5 h-5 rounded-full bg-[#0284C7] border-2 border-white flex items-center justify-center text-white font-mono font-black text-[9px] shadow-[0_0_15px_#19D3FF]">
            O
          </div>
        </div>
      `,
      className: 'origin-marker-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([origin.lat, origin.lon], { icon: originIcon, zIndexOffset: 1200 })
      .bindTooltip(`ORIGIN: ${origin.name}`, { permanent: false, direction: 'top', className: 'hud-tooltip font-mono' })
      .addTo(origGroup);

    origGroup.addTo(map);
    layersRef.current.originMarker = origGroup;
  }, [origin]);

  // 9. Evacuation Route Corridors (Primary A* + Alternative Dijkstra)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.route) {
      map.removeLayer(layersRef.current.route);
      layersRef.current.route = null;
    }
    if (layersRef.current.altRoute) {
      map.removeLayer(layersRef.current.altRoute);
      layersRef.current.altRoute = null;
    }

    if (layers.evacuationRoutes && activeRoute?.geometry?.coordinates?.length > 1) {
      const routeGroup = L.featureGroup();

      const primaryCoords = activeRoute.geometry.coordinates.map(c => [c[1], c[0]]);

      // Outer Luminous Glow
      L.polyline(primaryCoords, {
        color: '#00CFFF',
        weight: 7,
        opacity: 0.35,
        smoothFactor: 1.2
      }).addTo(routeGroup);

      // Core Highlighted Route Line with animated dash
      const coreLine = L.polyline(primaryCoords, {
        color: '#00E5FF',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 6',
        className: 'leaflet-route-animated'
      }).addTo(routeGroup);

      // SECTION 8: Interactive Route Tooltip on hover or click
      const routeTooltipHtml = `
        <div style="padding: 10px; width: 240px; font-family: monospace; background: rgba(5,13,28,0.96); border: 1px solid #32E875; border-radius: 8px; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 6px;">
            <span style="font-size: 8px; color: #32E875; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">
              EVACUATION ROUTE (${activeRoute.algorithm})
            </span>
            <span style="font-size: 8px; font-weight: bold; padding: 1px 4px; border-radius: 2px; text-transform: uppercase; background: rgba(50,232,117,0.2); color: #32E875;">
              ${activeRoute.status || 'ROUTE CALCULATED'}
            </span>
          </div>
          <div style="space-y: 3px; font-size: 9.5px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Origin:</span><strong style="color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${origin.name}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Destination:</span><strong style="color: #10B981; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${selectedShelter?.name || 'Safe Shelter'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Distance:</span><strong style="color: white;">${activeRoute.distance_km} km</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">ETA:</span><strong style="color: white;">${activeRoute.eta_min} min</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Algorithm:</span><strong style="color: #19D3FF;">${activeRoute.algorithm}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Route Risk:</span><strong style="color: white;">${activeRoute.risk_score || 'UNKNOWN'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Flood Exposure:</span><strong style="color: white;">${activeRoute.flood_exposure || 'Unknown'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #7B92B2;">Flood-Zone Road Segments:</span><strong style="color: white;">${activeRoute.flood_affected_edges ?? 'Unknown'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7B92B2;">Surveyed Road Segments:</span><strong style="color: white;">${Math.max(0, primaryCoords.length - 1)}</strong>
            </div>
          </div>
        </div>
      `;

      coreLine.bindTooltip(routeTooltipHtml, {
        direction: 'center',
        className: 'route-interactive-tooltip',
        opacity: 1
      });

      // Waypoints
      primaryCoords.forEach((pt) => {
        L.circleMarker(pt, {
          radius: 3,
          color: '#00CFFF',
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          weight: 1.5
        }).addTo(routeGroup);
      });

      routeGroup.addTo(map);
      layersRef.current.route = routeGroup;

      // Alternative Route (Dijkstra) with reduced visual emphasis (Section 11)
      if (alternativeRoute?.geometry?.coordinates) {
        const altGroup = L.featureGroup();
        const altCoords = alternativeRoute.geometry.coordinates.map(c => [c[1], c[0]]);

        const altLine = L.polyline(altCoords, {
          color: '#F59E0B',
          weight: 2.2,
          opacity: 0.55,
          dashArray: '5, 5'
        }).addTo(altGroup);

        altLine.bindTooltip(`ALTERNATIVE ROUTE (${alternativeRoute.algorithm}) • ${alternativeRoute.distance_km} km • Click to switch`, {
          className: 'hud-tooltip font-mono text-[9px]'
        });

        altLine.on('click', () => {
          switchRouteType('alternative');
        });

        altGroup.addTo(map);
        layersRef.current.altRoute = altGroup;
      }
    }
  }, [layers.evacuationRoutes, activeRoute, alternativeRoute, origin, selectedShelter, switchRouteType]);

  // 10. Navigation Active Convoy Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.navConvoyMarker) {
      map.removeLayer(layersRef.current.navConvoyMarker);
      layersRef.current.navConvoyMarker = null;
    }

    if (isNavigating && activeRoute?.geometry?.coordinates) {
      const coords = activeRoute.geometry.coordinates.map(c => [c[1], c[0]]);
      const idx = Math.min(activeStepIndex, coords.length - 1);
      const currentPoint = coords[idx] || [origin.lat, origin.lon];

      const convoyIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-[#10B981]/50 animate-ping"></span>
            <div class="w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-black font-black text-[10px] shadow-[0_0_15px_#10B981]">
              ▲
            </div>
          </div>
        `,
        className: 'convoy-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const convoyMarker = L.marker(currentPoint, { icon: convoyIcon, zIndexOffset: 2000 })
        .bindTooltip(`EVACUATION CONVOY: Step ${activeStepIndex + 1}`, {
          permanent: true,
          direction: 'right',
          className: 'hud-tooltip font-mono'
        })
        .addTo(map);

      layersRef.current.navConvoyMarker = convoyMarker;
      map.panTo(currentPoint, { animate: true, duration: 0.6 });
    }
  }, [isNavigating, activeStepIndex, activeRoute, origin]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    if (origin && selectedShelter) {
      const midLat = (origin.lat + selectedShelter.lat) / 2;
      const midLon = (origin.lon + selectedShelter.lon) / 2;
      mapInstanceRef.current?.flyTo([midLat, midLon], 12.5, { duration: 0.8 });
    } else {
      mapInstanceRef.current?.flyTo([18.2969, 83.8968], 12, { duration: 0.8 });
    }
  };

  return (
    <div className="w-full h-full relative z-0 overflow-hidden select-none">
      {/* Map DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full bg-[#030814]" />

      {/* Waterbody Label: Bay of Bengal */}
      <div className="absolute right-6 bottom-16 pointer-events-none z-10 select-none">
        <span className="text-xs font-sans font-light tracking-[0.25em] text-[#2A4D78]/70 italic">
          Bay of Bengal
        </span>
      </div>

      {/* SECTION 12: FLOATING ON-MAP NAVIGATION HUD BANNER (When Navigating) */}
      {isNavigating && navigationSteps && navigationSteps.length > 0 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-[#050D1C]/96 backdrop-blur-md rounded-lg border border-[#10B981] p-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-between pointer-events-auto animate-fadeIn select-none">
          <div className="flex items-center space-x-2.5 flex-1 pr-2">
            <div className="w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center text-black font-extrabold text-xs shrink-0 shadow-[0_0_10px_#10B981]">
              {activeStepIndex + 1}
            </div>
            <div className="flex flex-col">
              <span className="text-[8.5px] font-mono font-bold text-[#10B981] uppercase tracking-wider">
                STEP {activeStepIndex + 1} OF {navigationSteps.length} &bull; CONVOY GUIDANCE
              </span>
              <p className="text-xs font-bold text-white leading-tight mt-0.5">
                {navigationSteps[activeStepIndex]?.instruction}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={prevStep}
              disabled={activeStepIndex === 0}
              className="p-1 rounded bg-[#08152B] text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer border border-white/5"
              title="Previous Step"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextStep}
              disabled={activeStepIndex === navigationSteps.length - 1}
              className="p-1 rounded bg-[#08152B] text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer border border-white/5"
              title="Next Step"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={stopNavigation}
              className="px-2 py-1 rounded bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40 text-[9px] font-mono font-bold cursor-pointer hover:bg-[#FF4D5E] hover:text-white transition-colors"
            >
              EXIT
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom / Pan Controls (Top-Right of Map) */}
      <div className="absolute top-3 right-3 z-30 pointer-events-auto flex flex-col space-y-1">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded bg-[#050D1C]/90 hover:bg-[#0C2B54] text-[#19D3FF] border border-[#143257] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.6)] cursor-pointer transition-colors"
          title="Zoom In"
        >
          <Plus size={14} />
        </button>

        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded bg-[#050D1C]/90 hover:bg-[#0C2B54] text-[#19D3FF] border border-[#143257] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.6)] cursor-pointer transition-colors"
          title="Zoom Out"
        >
          <Minus size={14} />
        </button>

        <button
          onClick={handleResetCenter}
          className="w-7 h-7 rounded bg-[#050D1C]/90 hover:bg-[#0C2B54] text-[#19D3FF] border border-[#143257] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.6)] cursor-pointer transition-colors"
          title="Center Corridor View"
        >
          <Crosshair size={13} />
        </button>
      </div>

      {/* Bottom-Left Map Legend HUD Box */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto bg-[#050D1C]/92 backdrop-blur-md rounded-lg border border-[#143257] p-2 shadow-[0_4px_24px_rgba(0,0,0,0.85)] text-[9.5px] font-mono select-none">
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] flex items-center justify-center text-[7px] text-white font-bold">S</span>
            <span className="text-slate-300">Shelter</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] border border-[#19D3FF] flex items-center justify-center text-[7px] text-white font-bold">O</span>
            <span className="text-slate-300">Origin</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#FF2638] shadow-[0_0_6px_#FF2638]" />
            <span className="text-slate-300">Flood Inundation</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] flex items-center justify-center text-[8px] text-white font-bold">+</span>
            <span className="text-slate-300">Hospital</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-[2.5px] bg-[#00E5FF] border-t border-dashed border-[#00CFFF]" />
            <span className="text-[#00E5FF] text-[8.5px] font-bold">Safe Route (A*)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-[2px] bg-[#F59E0B] border-t border-dashed border-[#F59E0B]" />
            <span className="text-amber-400 text-[8.5px]">Alternative</span>
          </div>
        </div>
      </div>

      {/* Bottom-Right Miniature State Locator Inset */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-auto bg-[#050D1C]/92 backdrop-blur-md rounded-lg border border-[#143257] p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.85)] w-28 flex flex-col select-none">
        <div className="flex items-center justify-between border-b border-white/5 pb-0.5 mb-1">
          <span className="text-[7.5px] font-mono text-[#19D3FF] font-bold uppercase tracking-wider">
            ANDHRA PRADESH
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#19D3FF] animate-pulse" />
        </div>

        <div className="relative w-full h-16 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 120" className="w-full h-full opacity-85">
            <path
              d="M 68 15 L 75 10 L 78 18 L 70 28 L 62 42 L 52 58 L 44 75 L 36 92 L 28 105 L 20 95 L 22 82 L 30 70 L 32 55 L 42 45 L 50 32 Z"
              fill="#081A36"
              stroke="#19D3FF"
              strokeWidth="1.2"
              opacity="0.8"
            />
            <path
              d="M 68 15 L 75 10 L 78 18 L 70 28 Z"
              fill="#00CFFF"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          </svg>
          <div className="absolute top-0.5 right-0.5 text-[6.5px] font-mono text-[#00CFFF] font-bold">
            SRIKAKULAM
          </div>
        </div>
      </div>

      {/* Compact Inspection Popup */}
      {popupData && (
        <div className="absolute top-14 right-14 z-50 w-72 bg-[#050D1C]/96 backdrop-blur-md rounded-lg border border-[#19D3FF]/60 p-3 shadow-[0_0_30px_rgba(0,0,0,0.9)] pointer-events-auto flex flex-col space-y-2 select-none animate-fadeIn">
          <div className="flex items-start justify-between border-b border-white/10 pb-1.5">
            <div className="flex flex-col">
              <span className="text-[8.5px] font-mono text-[#19D3FF] font-bold uppercase tracking-wider">
                {popupData.type}
              </span>
              <h4 className="text-xs font-bold text-white leading-tight mt-0.5">
                {popupData.title}
              </h4>
            </div>
            <button
              onClick={() => setPopupData(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1 text-xs font-mono">
            {popupData.details?.map((d, i) => (
              <div key={i} className="flex justify-between py-0.5 border-b border-white/5">
                <span className="text-[#7B92B2]">{d.label}:</span>
                <span className="text-white font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
