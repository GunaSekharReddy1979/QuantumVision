"""
Visualization Pydantic Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class MapLayersRequest(BaseModel):
    center_latitude: float = 37.7749
    center_longitude: float = -122.4194
    zoom_level: int = 12
    include_heatmaps: bool = True
    include_shelters: bool = True
    include_hospitals: bool = True
    include_hazard_zones: bool = True
    include_evacuation_routes: bool = True

class HeatmapPoint(BaseModel):
    latitude: float
    longitude: float
    intensity: float

class MapLayersResponse(BaseModel):
    center: Dict[str, float]
    zoom: int
    hazard_polygons: List[Dict[str, Any]]
    heatmap_points: List[HeatmapPoint]
    shelter_markers: List[Dict[str, Any]]
    hospital_markers: List[Dict[str, Any]]
    active_evacuation_paths: List[Dict[str, Any]]
