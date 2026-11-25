# QuantumVision Dataset Documentation

## Supported File Formats
| Format | Typical Content | Standard CRS | Ingestion Handler |
|---|---|---|---|
| `.geojson` | Boundaries, Road Networks, Shelters | EPSG:4326 | GeoPandas / Shapely |
| `.tif` / `.tiff` | Digital Elevation Models (SRTM), Sentinel-1 SAR Inundation | EPSG:4326 / UTM | Rasterio |
| `.csv` | Cyclone tracks (IBTrACS), Weather stations, River gauge readings | WGS 84 Lat/Lon | Pandas |
| `.shp` | Legacy cadastral / administrative shapefiles | EPSG:4326 | GeoPandas |

## CRS Reprojection Workflow
When datasets are submitted via `/api/datasets/upload`:
1. `gis/crs_utils.py` inspects the layer header.
2. If CRS is missing, it is assigned EPSG:4326 with override warnings.
3. If CRS is projected (e.g. UTM Zone 44N), `gdf.to_crs(epsg=4326)` performs coordinate reprojection.
4. `gis/geometry_validation.py` executes `shapely.validation.make_valid` on polygon rings.
5. Ingested artifacts are saved to `data/processed/{category}/`.