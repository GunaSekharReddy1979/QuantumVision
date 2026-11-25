from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.location import Coordinate

class FacilityInfo(BaseModel):
    facility_id: str
    name: str
    facility_type: str  # "shelter", "hospital", "school"
    coordinate: Coordinate
    address: Optional[str] = None
    capacity: Optional[int] = 300
    current_occupancy: Optional[int] = 50
    occupancy_pct: Optional[float] = 16.7
    contact: Optional[str] = "+91-8942-222550"
    status: str = "OPEN"
    flood_risk: str = "Low"
    route_risk: str = "Low"
    distance_km: Optional[float] = None
    eta_mins: Optional[float] = None
    recommendation_status: Optional[str] = "Recommended"
    score: Optional[float] = 95.0

class FacilityNearbyRequest(BaseModel):
    coordinate: Optional[Coordinate] = None
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None
    radius_km: float = 25.0
    facility_type: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

    def model_post_init(self, __context: Any) -> None:
        if self.coordinate is None and self.user_latitude is not None and self.user_longitude is not None:
            self.coordinate = Coordinate(latitude=self.user_latitude, longitude=self.user_longitude)
        elif self.coordinate is None:
            self.coordinate = Coordinate(latitude=18.2969, longitude=83.8968)


class ShelterRecommendation(BaseModel):
    shelter_id: str
    name: str
    shelter_type: str
    coordinate: Coordinate
    distance_km: float
    eta_mins: float
    capacity_total: int
    occupancy_current: int
    capacity_pct: float
    available_space: int
    flood_risk: str
    route_risk: str
    accessibility: str
    safety_score: float
    shelter_score: float
    status: str  # "Recommended", "Alternative", "Standby"
    contact_phone: str
    supplies_status: Dict[str, str]

class FacilityExposureRequest(BaseModel):
    facility_id: str
    hazard_type: str = "flood"

class FacilityExposureResponse(BaseModel):
    facility_id: str
    hazard_type: str
    exposure_level: str
    vulnerability_score: float
    details: Dict[str, Any] = {}
