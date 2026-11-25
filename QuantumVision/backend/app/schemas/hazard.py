from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class HazardAnalyzeRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10.0
    time_offset_hours: int = 0

class HazardLayerInfo(BaseModel):
    layer_id: str
    name: str
    description: str

class FloodAnalysisResponse(BaseModel):
    location: Dict[str, float]
    flood_risk_level: str
    hazard_level: Optional[str] = None
    estimated_water_depth_m: Optional[float] = None
    water_level_m: Optional[float] = None
    affected_infrastructure: List[str] = []
    historical_similarity: float = 0.0

