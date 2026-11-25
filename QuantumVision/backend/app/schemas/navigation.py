"""
Navigation and Route Optimization Pydantic Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class NavigationRouteRequest(BaseModel):
    start_latitude: float = 37.7749
    start_longitude: float = -122.4194
    end_latitude: Optional[float] = 37.7833
    end_longitude: Optional[float] = -122.4167
    destination_type: str = "shelter"  # shelter, hospital, custom
    algorithm: str = "astar"  # astar, dijkstra, dynamic_rerouting, quantum_optimized
    avoid_active_hazards: bool = True
    safety_buffer_meters: float = 500.0

class Waypoint(BaseModel):
    latitude: float
    longitude: float
    instruction: Optional[str] = "Proceed"
    hazard_proximity_m: float = 2500.0
    safety_index: float = 0.98

class NavigationRouteResponse(BaseModel):
    route_id: str
    algorithm: str
    total_distance_km: float
    estimated_travel_time_min: float
    overall_safety_score: float
    hazard_zones_avoided: int
    waypoints: List[Waypoint]
    geojson_path: Dict[str, Any]
    nearest_shelter_assigned: Optional[str] = None
    evacuation_corridor_status: str = "CLEAR"
