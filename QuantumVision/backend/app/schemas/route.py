from pydantic import BaseModel, model_validator
from typing import Optional, List, Dict, Any
from app.schemas.location import Coordinate

class RouteRequest(BaseModel):
    origin: Optional[Coordinate] = None
    destination: Optional[Coordinate] = None
    origin_latitude: Optional[float] = None
    origin_longitude: Optional[float] = None
    destination_latitude: Optional[float] = None
    destination_longitude: Optional[float] = None
    algorithm: Optional[str] = "astar"
    hazard_avoidance: bool = True
    max_alternatives: int = 2
    rainfall_mm: Optional[float] = 0.0
    flood_severity: Optional[str] = "MODERATE"

    @model_validator(mode="before")
    @classmethod
    def populate_coordinates(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("origin") and data.get("origin_latitude") is not None and data.get("origin_longitude") is not None:
                data["origin"] = {"latitude": data["origin_latitude"], "longitude": data["origin_longitude"]}
            if not data.get("destination") and data.get("destination_latitude") is not None and data.get("destination_longitude") is not None:
                data["destination"] = {"latitude": data["destination_latitude"], "longitude": data["destination_longitude"]}
        return data

class RouteExplainRequest(BaseModel):
    route_id: str

class RouteGeometry(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]]

class RouteResponse(BaseModel):
    route_id: str
    geometry: RouteGeometry
    distance_km: float
    estimated_time_mins: float
    hazard_exposure: str
    route_cost: float
    route_type: str
    warnings: List[str] = []
    explanation: Dict[str, Any] = {}

class RouteAlternativeResponse(BaseModel):
    primary: RouteResponse
    alternatives: List[RouteResponse] = []
    total_distance_km: float = 0.0
    waypoints: List[List[float]] = []
    safety_disclaimer: str = (
        "Route follows mapped road-network data. Flood exposure reflects available mapped data, "
        "not real-time conditions or a safety guarantee; verify local conditions before travel."
    )

    def model_post_init(self, __context: Any) -> None:
        if self.primary:
            if self.total_distance_km == 0.0:
                self.total_distance_km = self.primary.distance_km
            if not self.waypoints and self.primary.geometry:
                self.waypoints = self.primary.geometry.coordinates

