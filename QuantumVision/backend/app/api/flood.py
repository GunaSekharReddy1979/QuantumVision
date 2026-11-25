"""
Flood API Endpoints for QuantumVision.
Handles:
- Flood status & regional telemetry
- Satellite & GIS flood extent layers
- Machine Learning Flood Prediction (RF & XGBoost on AP Telemetry)
- Risk zones generation
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.schemas.common import BaseResponse
from app.schemas.hazard import HazardAnalyzeRequest, HazardLayerInfo, FloodAnalysisResponse
from app.services.flood_service import flood_service
from app.services.flood_prediction_service import flood_prediction_service
from app.services.digital_twin_service import digital_twin_service

router = APIRouter(prefix="/api/flood", tags=["Flood Operations"])

class FloodPredictInput(BaseModel):
    daily_rainfall_mm: Optional[float] = 64.5
    prev_day_rainfall_mm: Optional[float] = 45.0
    cum_3d_rainfall_mm: Optional[float] = 142.0
    cum_7d_rainfall_mm: Optional[float] = 235.8
    cum_14d_rainfall_mm: Optional[float] = 310.0
    max_hourly_intensity: Optional[float] = 28.4
    temperature_c: Optional[float] = 28.0
    humidity_pct: Optional[float] = 88.0
    wind_speed_kmh: Optional[float] = 26.0
    surface_pressure_hpa: Optional[float] = 1006.0
    latitude: Optional[float] = 18.2969
    longitude: Optional[float] = 83.8968
    model: Optional[str] = "xgboost"

@router.get("/status", response_model=BaseResponse[Dict[str, Any]])
def get_flood_status():
    summary = digital_twin_service.get_digital_twin_summary()
    return BaseResponse(data=summary, message="Flood operational status retrieved")

@router.get("/extent", response_model=BaseResponse[Dict[str, Any]])
def get_flood_extent():
    extent_geojson = digital_twin_service.get_layers_geojson("flood")
    return BaseResponse(data=extent_geojson, message="Flood extent inundation polygons retrieved")

@router.get("/layers", response_model=BaseResponse[List[HazardLayerInfo]])
def get_flood_layers():
    layers = flood_service.get_layers()
    return BaseResponse(data=layers, message="Flood GIS layers retrieved")

@router.post("/analyze", response_model=BaseResponse[FloodAnalysisResponse])
def analyze_flood_point(req: HazardAnalyzeRequest):
    res = flood_service.analyze(req)
    return BaseResponse(data=res, message="Point flood hazard analysis complete")

@router.post("/predict", response_model=BaseResponse[Dict[str, Any]])
def predict_flood(input_data: FloodPredictInput):
    res = flood_prediction_service.predict(input_data.dict())
    return BaseResponse(data=res, message="Flood prediction generated successfully")

@router.get("/data-summary", response_model=BaseResponse[Dict[str, Any]])
def get_data_summary():
    data = flood_prediction_service.get_data_summary()
    return BaseResponse(data=data, message="Rainfall telemetry dataset summary retrieved")

@router.get("/rainfall-trends", response_model=BaseResponse[List[Dict[str, Any]]])
def get_rainfall_trends(days: int = Query(30, ge=7, le=90), station: Optional[str] = None):
    data = flood_prediction_service.get_rainfall_trends(days=days, station=station)
    return BaseResponse(data=data, message="Rainfall trends retrieved")

@router.get("/risk-timeline", response_model=BaseResponse[List[Dict[str, Any]]])
def get_risk_timeline(days: int = Query(7, ge=3, le=30)):
    data = flood_prediction_service.get_risk_timeline(days=days)
    return BaseResponse(data=data, message="Flood risk timeline retrieved")
