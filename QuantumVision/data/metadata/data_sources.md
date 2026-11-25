# QuantumVision Data Sources Directory

## 1. Earth Observation Data
- **Sensor:** Copernicus Sentinel-1A C-SAR (Synthetic Aperture Radar)
- **Mode:** Interferometric Wide (IW) Ground Range Detected High Resolution (GRDH)
- **Polarizations:** Dual-polarization VV and VH
- **Scene IDs:**
  - `S1A_IW_GRDH_1SDV_20250922T001420_20250922T001433_061093_079D62_4695.SAFE` (Pre-event)
  - `S1A_IW_GRDH_1SDV_20251004T001420_20251004T001432_061268_07A474_9399.SAFE` (Post-event)
- **Provider:** European Space Agency (ESA) Copernicus Open Access Hub

## 2. GIS & Hydrographic Vectors
- **River Network:** OpenStreetMap Surveyed Hydrography (`srikakulam_rivers.geojson`, 613 segments)
- **District Boundary:** Survey of India & Census 2011 Administrative Division (`srikakulam_boundary.geojson`)
- **Verified Flood Inundation:** Multidisciplinary GIS Ground Truth (`srikakulam_flood_inundation.geojson`, 250 polygons)

## 3. Hydrological & Meteorological Telemetry
- **Ground Weather Stations:** 8 automated stations across Srikakulam District (`Ichchapuram`, `Kalingapatnam`, `Narasannapeta`, `Palakonda`, `Palasa`, `Sompeta`, `Tekkali`, `Srikakulam Town`)
- **Observation Frequency:** Hourly records from 2021 to 2025 (>350,000 total observations)
