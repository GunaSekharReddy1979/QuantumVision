"""
Disaster Detection & Event Pydantic Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.common import BoundingBox

class DisasterDetectionRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    sensor_telemetry: Optional[Dict[str, Any]] = None
    latitude: Optional[float] = 37.7749
    longitude: Optional[float] = -122.4194

class DisasterDetectionResponse(BaseModel):
    detected: bool
    primary_disaster: str
    severity: str
    confidence: float
    quantum_confidence: float
    detections: List[BoundingBox] = []
    affected_zones: List[str] = []
    recommended_actions: List[str] = []
    heat_intensity_pct: float = 0.0

class DisasterEventCreate(BaseModel):
    title: str
    disaster_type: str
    severity: str = "moderate"
    status: str = "active"
    latitude: float
    longitude: float
    radius_km: float = 5.0
    affected_population: int = 0
    description: Optional[str] = None

class DisasterEventResponse(BaseModel):
    id: int
    event_id: str
    title: str
    disaster_type: str
    severity: str
    status: str
    latitude: float
    longitude: float
    radius_km: float
    affected_population: int
    confidence_score: float
    quantum_confidence: float
    description: Optional[str] = None

    class Config:
        from_attributes = True
