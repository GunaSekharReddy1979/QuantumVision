import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { SRIKAKULAM_SHELTERS_DATASET } from '../utils/shelterEngine';

/**
 * ShelterLayer component for Leaflet DigitalTwinMap
 * Renders verified evacuation shelters, flood relief centers, and hospitals.
 * Features:
 * - Dynamic zoom-aware spatial clustering at low zoom (< 12) to prevent marker blob overlap.
 * - Distinct, crisp symbols (emerald green for shelters, medical crimson for hospitals).
 * - Smooth cluster expansion on click (zooms into cluster center).
 * - Rich light-theme tooltips with verified facility metadata.
 */
export default function ShelterLayer({
  map,
  visible = true,
  shelters = null,
  selectedShelter = null,
  onSelectShelter = null,
  onSelectFeature = null,
  showHospitals = true,
}) {
  const layerGroupRef = useRef(null);
  const [facilitiesData, setFacilitiesData] = useState([]);

  // 1. Fetch facilities from GeoJSON if available, merge with master catalog
  useEffect(() => {
    fetch('/data/srikakulam_facilities.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Facilities geojson unavailable');
        return res.json();
      })
      .then((geojson) => {
        const parsed = (geojson.features || [])
          .filter((f) => f.geometry && f.geometry.coordinates)
          .filter((f) => {
            const [lon, lat] = f.geometry.coordinates;
            // Strict Srikakulam AOI containment (excludes Vizianagaram / Nellimarla / out-of-district points)
            return lon >= 83.60 && lon <= 84.85 && lat >= 18.25 && lat <= 19.30;
          })
          .map((f) => ({
            id: f.properties?.id || `fac_${Math.random()}`,
            name: f.properties?.name || 'Emergency Facility',
            type: f.properties?.type === 'hospital' ? 'Hospital' : 'Shelter',
            subtype: f.properties?.subtype || 'school',
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            totalCapacity: f.properties?.capacity || 300,
            currentOccupancy: Math.round((f.properties?.capacity || 300) * 0.45),
            isOpen: f.properties?.status !== 'CLOSED',
            status: f.properties?.status || 'OPERATIONAL',
            contact: f.properties?.contact || 'DDMA Srikakulam',
            district: 'Srikakulam',
          }));
        setFacilitiesData(parsed);
      })
      .catch(() => {
        setFacilitiesData([]);
      });
  }, []);

  // 2. Render Markers & Clusters
  const renderFacilities = useCallback(() => {
    if (!map) return;

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const group = layerGroupRef.current;
    group.clearLayers();

    if (!visible) return;

    // Strict Srikakulam District AOI containment checker
    const isWithinSrikakulam = (f) => f && f.lon >= 83.60 && f.lon <= 84.85 && f.lat >= 18.25 && f.lat <= 19.30;

    // Combine verified catalog with parsed GeoJSON
    const catalog = (shelters && shelters.length > 0 ? shelters : SRIKAKULAM_SHELTERS_DATASET).filter(isWithinSrikakulam);
    const combinedFacilities = [...catalog];

    if (showHospitals && facilitiesData.length > 0) {
      facilitiesData.forEach((fac) => {
        if (isWithinSrikakulam(fac) && !combinedFacilities.some((c) => c.name === fac.name)) {
          combinedFacilities.push(fac);
        }
      });
    }

    const currentZoom = map.getZoom();
    const shouldCluster = currentZoom < 12;
    const clusterPixelRadius = 38; // pixel distance threshold for clustering

    // Separate by type so hospitals and shelters cluster independently
    const shelterItems = combinedFacilities.filter((f) => f.type !== 'Hospital' && f.subtype !== 'hospital');
    const hospitalItems = showHospitals
      ? combinedFacilities.filter((f) => f.type === 'Hospital' || f.subtype === 'hospital')
      : [];

    const clusterList = (items, isHospitalType) => {
      if (!shouldCluster) {
        // Return individual items as single-element clusters
        return items.map((item) => ({
          isCluster: false,
          count: 1,
          lat: item.lat,
          lon: item.lon,
          items: [item],
          isHospital: isHospitalType,
        }));
      }

      const clusters = [];
      items.forEach((item) => {
        let p;
        try {
          p = map.latLngToLayerPoint([item.lat, item.lon]);
        } catch (_) {
          return;
        }

        let assigned = false;
        for (const cl of clusters) {
          const cp = map.latLngToLayerPoint([cl.lat, cl.lon]);
          const dist = Math.hypot(p.x - cp.x, p.y - cp.y);
          if (dist < clusterPixelRadius) {
            cl.items.push(item);
            // Recompute weighted centroid
            const n = cl.items.length;
            cl.lat = (cl.lat * (n - 1) + item.lat) / n;
            cl.lon = (cl.lon * (n - 1) + item.lon) / n;
            cl.count = n;
            cl.isCluster = true;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          clusters.push({
            isCluster: false,
            count: 1,
            lat: item.lat,
            lon: item.lon,
            items: [item],
            isHospital: isHospitalType,
          });
        }
      });

      return clusters;
    };

    const allClusters = [...clusterList(shelterItems, false), ...clusterList(hospitalItems, true)];

    allClusters.forEach((cl) => {
      if (cl.isCluster && cl.count > 1) {
        // --- CLUSTER BADGE RENDERING ---
        const badgeColor = cl.isHospital ? '#E11D48' : '#10B981';
        const badgeBorder = cl.isHospital ? '#BE123C' : '#059669';
        const badgeSymbol = cl.isHospital ? '+' : '⌂';
        const totalCap = cl.items.reduce((s, it) => s + (it.totalCapacity || 300), 0);

        const clusterIconHtml = `
          <div style="
            background: ${badgeColor};
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 12px;
            padding: 2px 7px;
            font-family: Inter, sans-serif;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            box-shadow: 0 2px 8px rgba(15,38,92,0.25);
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span>${badgeSymbol}</span>
            <span>${cl.count}</span>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterIconHtml,
          className: 'facility-cluster-icon',
          iconSize: [42, 24],
          iconAnchor: [21, 12],
        });

        const clusterMarker = L.marker([cl.lat, cl.lon], {
          icon: clusterIcon,
          zIndexOffset: cl.isHospital ? 500 : 450,
        });

        const itemsPreview = cl.items
          .slice(0, 4)
          .map((it) => `<li style="margin-bottom:2px; truncate;">• ${it.name}</li>`)
          .join('');
        const moreCount = cl.items.length > 4 ? `+${cl.items.length - 4} more` : '';

        const clusterTooltip = `
          <div style="background:#FFFFFF; border:1px solid #DCE7F6; border-radius:8px; padding:7px 10px; color:#0F265C; font-family:Inter, sans-serif; font-size:11px; box-shadow:0 4px 12px rgba(15,38,92,0.12); min-width:180px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #F1F5F9; padding-bottom:3px; margin-bottom:5px;">
              <span style="font-weight:700; color:${badgeColor}; font-size:10px;">${cl.count} ${cl.isHospital ? 'HOSPITALS' : 'SHELTERS'}</span>
              <span style="font-size:9.5px; color:#64748B;">Total Cap: ${totalCap}</span>
            </div>
            <ul style="list-style:none; padding:0; margin:0; color:#334155; font-size:10px; line-height:1.3;">
              ${itemsPreview}
            </ul>
            ${moreCount ? `<div style="font-size:9px; color:#64748B; margin-top:2px;">${moreCount}</div>` : ''}
            <div style="font-size:9px; color:#2167F3; font-weight:600; margin-top:5px; text-align:center;">Click to zoom into cluster</div>
          </div>
        `;

        clusterMarker.bindTooltip(clusterTooltip, { direction: 'top', className: 'light-tooltip' });

        clusterMarker.on('click', () => {
          map.setView([cl.lat, cl.lon], Math.min(map.getMaxZoom(), currentZoom + 2));
        });

        clusterMarker.addTo(group);
      } else {
        // --- INDIVIDUAL FACILITY MARKER ---
        const facility = cl.items[0];
        const isHospital = cl.isHospital;
        const isSelected = selectedShelter?.id === facility.id || selectedShelter?.name === facility.name;
        const isOpen = facility.isOpen !== false && facility.status !== 'CLOSED';
        const totalCap = facility.totalCapacity || 400;
        const occupancy = facility.currentOccupancy || 0;
        const available = Math.max(0, totalCap - occupancy);

        let markerColor = '#10B981'; // Emerald for shelters
        if (isHospital) {
          markerColor = '#E11D48'; // Medical crimson for hospitals (clearly distinguishable from blue flood water)
        } else if (!isOpen) {
          markerColor = '#94A3B8';
        } else if (occupancy / totalCap > 0.85) {
          markerColor = '#F59E0B';
        }

        const iconHtml = `
          <div style="position:relative; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            ${
              isSelected
                ? `<div style="position:absolute; width:26px; height:26px; border-radius:50%; background:rgba(33,103,243,0.25); border:2px solid #2167F3; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`
                : ''
            }
            <div style="
              width: ${isSelected ? '20px' : '16px'};
              height: ${isSelected ? '20px' : '16px'};
              border-radius: ${isHospital ? '50%' : '4px'};
              background: ${markerColor};
              border: 1.5px solid #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-size: ${isHospital ? '11px' : '9px'};
              font-weight: 800;
              box-shadow: 0 1px 3px rgba(0,0,0,0.25);
              transition: all 0.15s ease;
            ">
              ${isHospital ? '+' : '⌂'}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'facility-marker-icon',
          iconSize: isSelected ? [26, 26] : [18, 18],
          iconAnchor: isSelected ? [13, 13] : [9, 9],
        });

        const marker = L.marker([facility.lat, facility.lon], {
          icon,
          zIndexOffset: isSelected ? 1000 : (isHospital ? 450 : 400),
        });

        const tooltipHtml = `
          <div style="background: #FFFFFF; border: 1px solid #DCE7F6; border-radius: 8px; padding: 8px 10px; color: #1E293B; font-family: Inter, sans-serif; box-shadow: 0 4px 12px rgba(15,38,92,0.1); min-width: 170px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px; margin-bottom: 5px;">
              <span style="color:${isHospital ? '#E11D48' : '#2167F3'}; font-size:10px; font-weight:700;">
                ${isSelected ? 'SELECTED DESTINATION' : isHospital ? 'MEDICAL HUB' : 'RELIEF SHELTER'}
              </span>
              <span style="background:${isOpen ? '#EAF8EF' : '#F1F5F9'}; color:${isOpen ? '#10B981' : '#64748B'}; font-size:9px; font-weight:700; padding:1px 5px; border-radius:4px;">
                ${isOpen ? 'OPERATIONAL' : 'CLOSED'}
              </span>
            </div>
            <div style="font-weight:700; font-size:12px; color:#0F265C; margin-bottom:4px; line-height:1.2;">
              ${facility.name}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10.5px; color:#64748B;">
              <span>Capacity: <strong style="color:#1E293B;">${totalCap}</strong></span>
              <span>Available: <strong style="color:${markerColor};">${available}</strong></span>
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipHtml, {
          direction: 'top',
          className: 'light-tooltip',
        });

        marker.on('click', () => {
          if (onSelectShelter) onSelectShelter(facility);
          if (onSelectFeature) {
            onSelectFeature({
              type: isHospital ? 'HOSPITAL' : 'SHELTER',
              title: facility.name,
              status: facility.status || (isOpen ? 'Operational' : 'Closed'),
              source: 'DDMA Srikakulam Facility Catalog',
              metrics: [
                { label: 'Facility Type', value: facility.type || (isHospital ? 'Hospital' : 'Relief Shelter') },
                { label: 'Total Capacity', value: `${totalCap} persons` },
                { label: 'Available Slots', value: `${available} slots` },
                { label: 'Flood Risk Level', value: facility.riskLevel || 'LOW (High Ground)' },
                { label: 'Emergency Contact', value: facility.contact || 'Srikakulam DDMA' },
                { label: 'Coordinates', value: `${facility.lat.toFixed(4)}°N, ${facility.lon.toFixed(4)}°E` },
              ],
              raw: facility,
            });
          }
        });

        marker.addTo(group);
      }
    });
  }, [map, visible, shelters, facilitiesData, selectedShelter, onSelectShelter, onSelectFeature, showHospitals]);

  // Re-cluster on map zoom
  useEffect(() => {
    if (!map) return;
    renderFacilities();

    const handleZoomEnd = () => {
      renderFacilities();
    };

    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
      }
    };
  }, [map, renderFacilities]);

  return null;
}
