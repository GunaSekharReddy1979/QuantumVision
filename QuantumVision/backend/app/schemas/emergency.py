"""
Emergency SOS & Dispatch Pydantic Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SOSAlertCreate(BaseModel):
    caller_name: str = "Emergency Citizen"
    phone_number: str = "555-0199"
    latitude: float = 37.7749
    longitude: float = -122.4194
    emergency_type: str = "Trapped in Flash Flood"
    number_of_people: int = 2
    critical_medical_needs: bool = False
    details: Optional[str] = "Water rising fast on 1st floor."

class SOSAlertResponse(BaseModel):
    sos_id: str
    status: str  # DISPATCHED, ACKNOWLEDGED, RESCUED, EN_ROUTE
    priority: str  # P1_CRITICAL, P2_HIGH, P3_MODERATE
    assigned_responder_unit: str
    estimated_arrival_minutes: int
    nearest_hospital: str
    nearest_shelter: str
    dispatch_timestamp: str
