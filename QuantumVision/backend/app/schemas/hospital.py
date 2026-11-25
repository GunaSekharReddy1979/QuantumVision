"""
Hospital Pydantic Schemas.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel

class HospitalCreate(BaseModel):
    hospital_id: str
    name: str
    latitude: float
    longitude: float
    icu_beds_total: int = 50
    icu_beds_available: int = 12
    general_beds_total: int = 200
    general_beds_available: int = 45
    blood_bank_status: str = "OPERATIONAL"
    trauma_level: str = "Level 1"
    status: str = "OPERATIONAL"
    contact_phone: str = "911-HOSPITAL"

class HospitalResponse(BaseModel):
    id: int
    hospital_id: str
    name: str
    latitude: float
    longitude: float
    icu_beds_total: int
    icu_beds_available: int
    general_beds_total: int
    general_beds_available: int
    blood_bank_status: str
    trauma_level: str
    is_operational: bool
    status: str
    contact_phone: str
    equipment_status: Dict[str, Any]

    class Config:
        from_attributes = True
