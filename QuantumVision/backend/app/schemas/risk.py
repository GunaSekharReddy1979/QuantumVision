from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class RiskPredictRequest(BaseModel):
    latitude: float
    longitude: float
    hazard_type: str = "flood"  # "flood"
    model: Optional[str] = "xgboost"
    model_name: Optional[str] = None
    features: Optional[Dict[str, Any]] = None


class RiskExplanation(BaseModel):
    method: str
    feature_name: str
    feature_value: float
    contribution: Optional[float] = None
    explanation_text: str

class RiskPredictionResponse(BaseModel):
    location: Dict[str, float]
    hazard_type: str
    risk_score: float
    risk_category: str
    model_method: str
    explanations: List[RiskExplanation] = []
    top_contributing_features: List[Dict[str, Any]] = [
        {"feature": "accumulated_rainfall_mm", "contribution": 0.35},
        {"feature": "elevation_m", "contribution": -0.20}
    ]
    uncertainty: Optional[float] = None

