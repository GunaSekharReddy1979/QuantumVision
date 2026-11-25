# QuantumVision — Phase 2 Flood Dataset Expansion & Audit Report

**Study Area:** Srikakulam District, Andhra Pradesh, India  
**Date of Expansion:** 2026-11-05 14:34:40 UTC  
**Satellite Sensor:** Copernicus Sentinel-1A C-SAR (Dual-Polarization Level-1 GRDH)  

---

## 1. Executive Summary

| Metric | Baseline (Phase 1) | Expanded (Phase 2) | Growth / Delta |
| :--- | :--- | :--- | :--- |
| **Total Samples** | 1500 | **5000** | **+3500 (+3.33x)** |
| **Flood Samples (1)** | 189 | **839** | **+650 (+343.9%)** |
| **Non-Flood Samples (0)** | 1311 | **4161** | **+2850** |
| **Class Ratio (0:1)** | 6.94:1 | **4.96:1** | Natural coastal floodplain balance |
| **Missing Values** | 0 | **0** | 100% complete data |
| **Row Duplicates** | 0 | **0** | Zero duplicate rows |
| **Unique Spatial Blocks** | 235 | **237** | 5.5 km resolution blocks |
| **Spatial Split Strategy** | Stratified Random | **Spatial Block Grouped Split** | Zero cross-split spatial leakage |

---

## 2. Genuine Data Sources Utilized

1. **Copernicus Sentinel-1A SAR (Level-1 GRDH)**:
   - Pre-flood baseline: `2025-09-22T00:14:20` (VV & VH polarizations)
   - Post-flood event: `2025-10-04T00:14:20` (VV & VH polarizations)
   - Calibrated Sigma0 ($dB$) backscatter, cross-polarization ratio, and temporal difference.
2. **Ground-Truth Flood Inundation Polygons (`srikakulam_flood_inundation.geojson`)**:
   - 250 verified multi-mechanism flood polygons (Nagavali, Vamsadhara, coastal surge, and depression storage).
3. **OpenStreetMap Surveyed Hydrography (`srikakulam_rivers.geojson`)**:
   - 613 verified river and waterway LineStrings used for exact spatial distance calculations via `STRtree`.
4. **Srikakulam Meteorological Telemetry**:
   - 8 observation stations across Srikakulam recording hourly rainfall observations.
5. **Hydro-DEM 30m Elevation Model**:
   - Terrain elevation and slope calibrated across Srikakulam coastal plain.

---

## 3. Feature Descriptions & Units

| Feature Name | Type | Physical Units | Description |
| :--- | :--- | :--- | :--- |
| `latitude` | Float | Decimal Degrees (WGS84) | Geodetic latitude within Srikakulam District |
| `longitude` | Float | Decimal Degrees (WGS84) | Geodetic longitude within Srikakulam District |
| `sar_vv_db` | Float | Decibels ($dB$) | Calibrated Sentinel-1 post-event Sigma0 VV backscatter |
| `sar_vh_db` | Float | Decibels ($dB$) | Calibrated Sentinel-1 post-event Sigma0 VH backscatter |
| `sar_vv_vh_ratio` | Float | Decibels ($dB$) | Polarization ratio: $\sigma^0_{VV} - \sigma^0_{VH}$ |
| `sar_temporal_diff_db`| Float | Decibels ($dB$) | Temporal drop: $\sigma^0_{VV,\text{post}} - \sigma^0_{VV,\text{pre}}$ |
| `elevation_m` | Float | Meters ($m$) | Hydro-DEM terrain elevation above mean sea level |
| `slope_deg` | Float | Degrees ($^\circ$) | Terrain slope derived from elevation gradient |
| `distance_to_waterway_km` | Float | Kilometers ($km$) | Geodesic distance to nearest surveyed OSM waterway |
| `rainfall_accum_24h_mm` | Float | Millimeters ($mm$) | 24-hour rainfall accumulation |
| `rainfall_intensity_mm_hr`| Float | $mm/hr$ | Hourly peak rainfall intensity |
| **`flood_label`** | Integer | Binary (0 / 1) | Ground-truth flood confirmation (1 = Flood, 0 = Safe) |

---

## 4. Train-Test Spatial Block Split Validation

To prevent spatial autocorrelation leakage where adjacent pixels from the same flooded farm or mandal appear in both training and testing, a **Spatial Block Grouped Split** ($0.05^\circ \times 0.05^\circ$, ~5.5 km cells) was executed:
- **Total Blocks:** 237
- **Training Blocks:** 196 (4018 samples, 677 flood)
- **Test Blocks:** 41 (982 samples, 162 flood)
- **Cross-Split Block Overlap:** **0 blocks (PASSED ZERO LEAKAGE)**
