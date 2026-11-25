# QuantumVision Geospatial Dataset Storage Guide

## Overview
This directory stores all raw, processed, and engineered feature datasets for Andhra Pradesh disaster intelligence.

## Directory Structure
```
data/
├── raw/                  # Original, unedited source files (read-only)
│   ├── flood/            # Sentinel-1 SAR imagery, gauge readings
│   ├── cyclone/          # IBTrACS storm tracks, IMD bulletins
│   ├── common/           # Andhra Pradesh state/district boundaries, OSM roads
│   ├── terrain/          # SRTM 30m Digital Elevation Models (DEM)
│   ├── roads/            # OpenStreetMap highway layers
│   ├── facilities/       # Government cyclone shelters, GGH hospitals
│   └── uploads/          # Temporary incoming uploaded user files
│
├── processed/            # Cleaned, clipped, and reprojected datasets
│   ├── flood/            # Inundation polygons, flood depth rasters
│   ├── cyclone/          # Wind radii buffers, landfall tracks
│   ├── common/           # Standardized GeoJSON boundary layers
│   ├── terrain/          # Slope and aspect GeoTIFFs
│   ├── roads/            # NetworkX serialized road graph
│   └── facilities/       # Validated shelters and health centers
│
└── features/             # ML-ready tabular matrices
    ├── flood_features.csv
    ├── cyclone_features.csv
    ├── combined_hazard_features.csv
    └── feature_metadata.json
```

## Coordinate Reference System (CRS) Standard
All vector and raster datasets consumed by the FastAPI backend and CesiumJS frontend must conform to **EPSG:4326 (WGS 84)**. Datasets in UTM (e.g. EPSG:32644) are automatically transformed during ingestion via `gis/crs_utils.py`.

## Data Placement Instructions
- **State Boundaries**: `data/raw/common/boundaries/andhra_pradesh/`
- **Satellite Rasters (SAR/DEM)**: `data/raw/flood/sentinel1/` or `data/raw/terrain/dem/`
- **Cyclone Tracks**: `data/raw/cyclone/ibtracs/north_indian/`
- **Uploaded Datasets**: Stored temporarily in `data/raw/uploads/temporary/`