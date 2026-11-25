"""
Risk Prediction Pydantic Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    region_name: str = "Coastal Sector 4"
    disaster_type: str = "flood"
    latitude: float = 37.7749
    longitude: float = -122.4194
    rainfall_mm: float = 85.0
    wind_speed_kmh: float = 45.0
    temperature_c: float = 28.5
    humidity_pct: float = 88.0
    pressure_hpa: float = 1002.0
    soil_moisture_pct: float = 72.0
    slope_angle_deg: float = 12.0
    horizon_hours: int = 24

class PredictionResponse(BaseModel):
    prediction_id: str
    region_name: str
    disaster_type: str
    risk_probability: float
    quantum_risk_index: float
    risk_level: str
    confidence_interval: List[float] = [0.82, 0.94]
    top_contributing_factors: Dict[str, float]
    advisory: str
    evacuation_urgency: str
    model_attribution: str = "Hybrid Classical-Quantum Ensemble (XGBoost + QSVC)"
