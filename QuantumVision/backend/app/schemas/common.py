"""
Common Pydantic Schemas.
"""
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Generic, TypeVar, Any, Dict, List, Literal

T = TypeVar("T")

DataMode = Literal[
    "LIVE", "HISTORICAL", "FORECAST", "UPLOADED", 
    "MODEL_DERIVED", "RULE_BASED", "SIMULATED", "DEMO", "UNAVAILABLE"
]

class BaseResponse(BaseModel, Generic[T]):
    status: str = "success"
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    data_mode: Optional[DataMode] = None
    source: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    processing_status: Optional[str] = None
    warnings: Optional[List[str]] = None
    limitations: Optional[List[str]] = None

class HealthStatusResponse(BaseModel):
    status: str = "healthy"
    version: str = "2.0.0"
    spatial_focus: str = "Srikakulam, Andhra Pradesh, India"
    services: Dict[str, str] = {
        "database": "online",
        "quantum_engine": "ready",
        "computer_vision": "ready",
        "simulation_core": "ready",
        "navigation_core": "ready"
    }


class GeoPoint(BaseModel):
    latitude: float
    longitude: float
    altitude_m: Optional[float] = 0.0

class BoundingBox(BaseModel):
    xmin: float
    ymin: float
    xmax: float
    ymax: float
    label: str
    confidence: float
