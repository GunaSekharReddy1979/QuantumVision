"""
Shelter Pydantic Schemas.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ShelterCreate(BaseModel):
    shelter_id: str
    name: str
    shelter_type: str = "Evacuation Center"
    latitude: float
    longitude: float
    total_capacity: int = 500
    current_occupancy: int = 0
    status: str = "OPEN"
    contact_phone: str = "1-800-SHELTER"

class ShelterResponse(BaseModel):
    id: int
    shelter_id: str
    name: str
    shelter_type: str
    latitude: float
    longitude: float
    total_capacity: int
    current_occupancy: int
    available_space: int
    is_open: bool
    status: str
    contact_phone: str
    supplies_status: Dict[str, Any]

    class Config:
        from_attributes = True
