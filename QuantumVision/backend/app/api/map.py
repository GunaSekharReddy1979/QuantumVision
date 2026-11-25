import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.common import BaseResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/map", tags=["Map Layers"])

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "processed"

RIVERS_PATH = DATA_DIR / "rivers" / "srikakulam_rivers.geojson"
BRIDGES_PATH = DATA_DIR / "infrastructure" / "srikakulam_bridges.geojson"
BOUNDARY_PATH = DATA_DIR / "boundaries" / "srikakulam_boundary.geojson"
FACILITIES_PATH = DATA_DIR / "facilities" / "srikakulam_facilities.geojson"
FLOOD_PATH = DATA_DIR / "flood" / "srikakulam_flood_inundation.geojson"

class LayerMetadata(BaseModel):
    layer_id: str
    name: str
    geometry_type: str
    data_source: str
    data_mode: str
    timestamp: str
    availability: bool
    legend: Optional[Dict[str, Any]] = None
    processing_status: str
    limitations: Optional[List[str]] = None

AUTHENTIC_LAYERS = {
    "srikakulam_boundary": LayerMetadata(
        layer_id="srikakulam_boundary",
        name="Authoritative Srikakulam District Boundary",
        geometry_type="Polygon",
        data_source="Census of India 2011 / Survey of India",
        data_mode="HISTORICAL",
        timestamp="2026-10-31T00:00:00Z",
        availability=True,
        processing_status="ready",
        limitations=["Administrative district AOI boundary"]
    ),
    "srikakulam_rivers": LayerMetadata(
        layer_id="srikakulam_rivers",
        name="Vamsadhara & Nagavali River Systems and Canals",
        geometry_type="LineString",
        data_source="OpenStreetMap Hydrographic Survey",
        data_mode="HISTORICAL",
        timestamp="2026-10-31T00:00:00Z",
        availability=True,
        processing_status="ready",
        limitations=["Clipped strictly to Srikakulam District AOI"]
    ),
    "srikakulam_bridges": LayerMetadata(
        layer_id="srikakulam_bridges",
        name="Surveyed Highway and Road Bridges",
        geometry_type="LineString",
        data_source="OpenStreetMap Infrastructure Survey",
        data_mode="HISTORICAL",
        timestamp="2026-10-31T00:00:00Z",
        availability=True,
        processing_status="ready",
        limitations=["Bridge structures on NH-16 and regional corridors"]
    ),
    "srikakulam_facilities": LayerMetadata(
        layer_id="srikakulam_facilities",
        name="Verified Emergency Shelters & Hospitals",
        geometry_type="Point",
        data_source="Srikakulam DDMA Official Facility Directory",
        data_mode="HISTORICAL",
        timestamp="2026-10-31T00:00:00Z",
        availability=True,
        processing_status="ready",
        limitations=["166 verified facilities inside district boundary"]
    ),
    "srikakulam_flood": LayerMetadata(
        layer_id="srikakulam_flood",
        name="Flood Inundation Extent",
        geometry_type="MultiPolygon",
        data_source="Copernicus DEM & Sentinel-1 SAR C-Band",
        data_mode="MODEL_DERIVED",
        timestamp="2026-10-31T00:00:00Z",
        availability=True,
        processing_status="ready",
        limitations=["Satellite radar backscatter & hydraulic slope analysis"]
    )
}

def _load_geojson(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {"type": "FeatureCollection", "features": []}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/layers", response_model=BaseResponse[List[LayerMetadata]])
def get_map_layers():
    """List all verified Srikakulam GIS map layers."""
    return BaseResponse(data=list(AUTHENTIC_LAYERS.values()), data_mode="HISTORICAL")

@router.get("/layers/{layer_id}", response_model=BaseResponse[LayerMetadata])
def get_layer_metadata(layer_id: str):
    """Get metadata for a specific layer."""
    layer = AUTHENTIC_LAYERS.get(layer_id)
    if not layer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Layer not found")
    return BaseResponse(data=layer, data_mode=layer.data_mode)

@router.get("/rivers", response_model=BaseResponse[Dict[str, Any]])
def get_rivers():
    """Returns verified Srikakulam river systems and canals GeoJSON."""
    geojson = _load_geojson(RIVERS_PATH)
    return BaseResponse(data=geojson, data_mode="HISTORICAL", message="Srikakulam waterways retrieved successfully")

@router.get("/bridges", response_model=BaseResponse[Dict[str, Any]])
def get_bridges():
    """Returns verified Srikakulam surveyed bridges GeoJSON."""
    geojson = _load_geojson(BRIDGES_PATH)
    return BaseResponse(data=geojson, data_mode="HISTORICAL", message="Srikakulam bridges retrieved successfully")

@router.get("/boundary", response_model=BaseResponse[Dict[str, Any]])
def get_boundary():
    """Returns authoritative Srikakulam district boundary GeoJSON."""
    geojson = _load_geojson(BOUNDARY_PATH)
    return BaseResponse(data=geojson, data_mode="HISTORICAL", message="Srikakulam boundary retrieved successfully")

@router.get("/facilities", response_model=BaseResponse[Dict[str, Any]])
def get_facilities():
    """Returns verified Srikakulam emergency facilities GeoJSON."""
    geojson = _load_geojson(FACILITIES_PATH)
    return BaseResponse(data=geojson, data_mode="HISTORICAL", message="Srikakulam facilities retrieved successfully")

@router.get("/layers/{layer_id}/geojson", response_model=BaseResponse[Dict[str, Any]])
def get_layer_geojson(layer_id: str):
    """Get GeoJSON data for a specific layer."""
    layer_map = {
        "srikakulam_boundary": BOUNDARY_PATH,
        "srikakulam_rivers": RIVERS_PATH,
        "srikakulam_bridges": BRIDGES_PATH,
        "srikakulam_facilities": FACILITIES_PATH,
        "srikakulam_flood": FLOOD_PATH
    }
    path = layer_map.get(layer_id)
    if not path or not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Layer '{layer_id}' not found")

    geojson = _load_geojson(path)
    return BaseResponse(data=geojson, data_mode="HISTORICAL")

@router.get("/metadata", response_model=BaseResponse[Dict[str, Any]])
def get_map_system_metadata():
    """Get global map system metadata."""
    return BaseResponse(
        data={
            "default_crs": "EPSG:4326 (WGS84)",
            "supported_formats": ["geojson", "shapefile", "geotiff"],
            "region": "Srikakulam District, Andhra Pradesh, India",
            "aoi_bounds": {
                "min_lon": 83.414,
                "max_lon": 84.769,
                "min_lat": 18.083,
                "max_lat": 19.166
            }
        },
        data_mode="HISTORICAL"
    )
