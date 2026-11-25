from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any

class Coordinate(BaseModel):
    latitude: float = Field(18.2969, ge=-90.0, le=90.0)
    longitude: float = Field(83.8968, ge=-180.0, le=180.0)

class LocationValidateRequest(BaseModel):
    coordinate: Coordinate

class LocationSelectRequest(BaseModel):
    coordinate: Optional[Coordinate] = None
    district_id: Optional[str] = None
    place_name: Optional[str] = None
    radius_km: Optional[float] = Field(5.0, ge=0.1, le=100.0)

    @model_validator(mode="before")
    @classmethod
    def set_default_coordinate(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("coordinate"):
                data["coordinate"] = {"latitude": 16.5062, "longitude": 80.6480}
        return data

class LocationInfo(BaseModel):
    location_id: str
    name: str
    type: str = "custom"
    coordinate: Coordinate
    district: Optional[Any] = None
    state: str = "Andhra Pradesh"
    is_coastal: bool = False
    metadata: Dict[str, Any] = {}

class DistrictInfo(BaseModel):
    name: str
    code: Optional[str] = None
    id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bounding_box: Optional[Dict[str, float]] = None
