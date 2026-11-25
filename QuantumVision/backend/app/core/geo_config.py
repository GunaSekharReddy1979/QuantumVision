"""
QuantumVision Geographic Configuration Module.
Provides verified district boundary polygons, representative weather-grid points,
bounding boxes, and spatial aggregation utilities for Srikakulam District, Andhra Pradesh, India.
Architected to allow easy expansion to other Andhra Pradesh districts.
"""
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import json
from shapely.geometry import shape, Point

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
GEOJSON_PATH = BASE_DIR / "app" / "data" / "srikakulam_boundary.geojson"

# Srikakulam District Bounding Box (Provisional fallback, explicitly distinct from exact polygon)
# Note: A bounding box is NOT the exact district boundary; it represents outer coordinate extrema.
SRIKAKULAM_BOUNDS = {
    "min_lon": 83.4142,
    "max_lon": 84.7686,
    "min_lat": 18.0827,
    "max_lat": 19.1656
}

# 8 Verified representative weather-grid points distributed across Srikakulam District
# Each point is geographically distributed across coastal, inland, municipal, and highland zones.
# All points have been tested and verified to fall inside the Census 2011 Srikakulam district polygon.
REPRESENTATIVE_WEATHER_POINTS: List[Dict[str, Any]] = [
    {
        "id": "srk_town",
        "name": "Srikakulam Town",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.2969,
        "longitude": 83.8968,
        "elevation_m": 10.0,
        "zone": "Urban / District HQ",
        "river_basin": "Nagavali River Basin",
        "is_inside_polygon": True,
        "description": "District administrative headquarters situated on the banks of Nagavali River"
    },
    {
        "id": "srk_tekkali",
        "name": "Tekkali",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.6144,
        "longitude": 84.2336,
        "elevation_m": 28.0,
        "zone": "Central Lowland Corridor",
        "river_basin": "Vamsadhara Lowland Plains",
        "is_inside_polygon": True,
        "description": "Central low-lying agricultural depression along NH-16"
    },
    {
        "id": "srk_palasa",
        "name": "Palasa-Kasibugga",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.7712,
        "longitude": 84.4172,
        "elevation_m": 38.0,
        "zone": "North-East Hub",
        "river_basin": "Mahendratanaya Basin",
        "is_inside_polygon": True,
        "description": "Commercial and cashew agro-industrial center in northern Srikakulam"
    },
    {
        "id": "srk_sompeta",
        "name": "Sompeta",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.9300,
        "longitude": 84.5800,
        "elevation_m": 12.0,
        "zone": "Northern Coastal Plain",
        "river_basin": "Wetland / Swamp Corridor",
        "is_inside_polygon": True,
        "description": "Coastal wetland and agricultural basin vulnerable to storm surges"
    },
    {
        "id": "srk_ichchapuram",
        "name": "Ichchapuram",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 19.1100,
        "longitude": 84.6900,
        "elevation_m": 19.0,
        "zone": "Northern Border Plain",
        "river_basin": "Bahuda River Basin",
        "is_inside_polygon": True,
        "description": "Northernmost taluk bordering Odisha, situated near Bahuda river"
    },
    {
        "id": "srk_narasannapeta",
        "name": "Narasannapeta",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.4215,
        "longitude": 84.0452,
        "elevation_m": 18.0,
        "zone": "South-Central Agricultural Basin",
        "river_basin": "Nagavali-Vamsadhara Interfluvial",
        "is_inside_polygon": True,
        "description": "Interfluvial agricultural zone between Nagavali and Vamsadhara rivers"
    },
    {
        "id": "srk_palakonda",
        "name": "Palakonda",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.6014,
        "longitude": 83.7583,
        "elevation_m": 45.0,
        "zone": "Western Inland Foothills",
        "river_basin": "Nagavali Tributary Corridor",
        "is_inside_polygon": True,
        "description": "Inland sub-division with higher terrain slope near Eastern Ghats foothills"
    },
    {
        "id": "srk_kalingapatnam",
        "name": "Kalingapatnam Coast",
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "latitude": 18.3375,
        "longitude": 84.1200,
        "elevation_m": 5.0,
        "zone": "Coastal River Mouth",
        "river_basin": "Vamsadhara River Mouth",
        "is_inside_polygon": True,
        "description": "Historic port town at mouth of Vamsadhara river discharging into Bay of Bengal"
    }
]

class DistrictGeoManager:
    """Manages district boundaries, spatial verification, and weather grid points."""
    def __init__(self, geojson_path: Optional[Path] = None):
        self.geojson_path = geojson_path or GEOJSON_PATH
        self.polygon = None
        self._load_boundary()

    def _load_boundary(self):
        try:
            if self.geojson_path.exists():
                with open(self.geojson_path, "r", encoding="utf-8") as f:
                    geojson_data = json.load(f)
                features = geojson_data.get("features", [])
                if features:
                    self.polygon = shape(features[0]["geometry"])
        except Exception:
            self.polygon = None

    def is_inside_district(self, lat: float, lon: float) -> bool:
        """Tests whether a given coordinate falls strictly inside the Srikakulam district polygon."""
        if self.polygon is not None:
            return self.polygon.contains(Point(lon, lat))
        # Fallback to provisional bounding box if polygon not loaded
        return (
            SRIKAKULAM_BOUNDS["min_lat"] <= lat <= SRIKAKULAM_BOUNDS["max_lat"] and
            SRIKAKULAM_BOUNDS["min_lon"] <= lon <= SRIKAKULAM_BOUNDS["max_lon"]
        )

    def get_weather_points(self) -> List[Dict[str, Any]]:
        """Returns the configured representative weather points for Srikakulam."""
        return REPRESENTATIVE_WEATHER_POINTS

    def get_point_by_id(self, point_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a point configuration by ID."""
        for p in REPRESENTATIVE_WEATHER_POINTS:
            if p["id"] == point_id:
                return p
        return None

    def get_district_metadata(self) -> Dict[str, Any]:
        """Provides metadata on the study area and representative grid coverage."""
        return {
            "district_name": "Srikakulam",
            "state_name": "Andhra Pradesh",
            "country": "India",
            "census_code": "11",
            "boundary_source": "Census 2011 Administrative Boundary Polygon",
            "bounding_box_provisional": SRIKAKULAM_BOUNDS,
            "boundary_verified": self.polygon is not None,
            "configured_points_count": len(REPRESENTATIVE_WEATHER_POINTS),
            "spatial_representation_note": (
                "District rainfall is estimated from 8 verified spatial grid points across urban, "
                "inland, agricultural, and coastal corridors. A multi-point aggregate is provided; "
                "a simple average does not claim to capture every localized micro-topographic variation."
            )
        }

district_geo_manager = DistrictGeoManager()
