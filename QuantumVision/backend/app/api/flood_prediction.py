"""
QuantumVision Flood Prediction API Endpoints
Provides data validation summary, trained model performance, feature importances,
real-time inference, what-if scenarios, and spatial risk points.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, Body
from pydantic import BaseModel

from app.schemas.common import BaseResponse
from app.services.flood_prediction_service import flood_prediction_service

router = APIRouter(prefix="/api/flood", tags=["Flood Prediction Engine"])

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

class WhatIfInput(BaseModel):
    rainfall_increase_pct: float = 50.0
    baseline: Optional[Dict[str, Any]] = None

@router.get("/data-summary", response_model=BaseResponse[Dict[str, Any]])
def get_data_summary():
    data = flood_prediction_service.get_data_summary()
    return BaseResponse(data=data, message="Rainfall dataset validation summary retrieved")

@router.get("/model-performance", response_model=BaseResponse[Dict[str, Any]])
def get_model_performance():
    data = flood_prediction_service.get_model_performance()
    return BaseResponse(data=data, message="Trained model performance retrieved")

@router.get("/feature-importance", response_model=BaseResponse[List[Dict[str, Any]]])
def get_feature_importance():
    data = flood_prediction_service.get_feature_importance()
    return BaseResponse(data=data, message="Feature importance ranking retrieved")

@router.get("/rainfall-trends", response_model=BaseResponse[List[Dict[str, Any]]])
def get_rainfall_trends(days: int = Query(30, ge=7, le=90), station: Optional[str] = None):
    data = flood_prediction_service.get_rainfall_trends(days=days, station=station)
    return BaseResponse(data=data, message="Rainfall trend timeseries retrieved")

@router.get("/risk-timeline", response_model=BaseResponse[List[Dict[str, Any]]])
def get_risk_timeline(days: int = Query(7, ge=3, le=30)):
    data = flood_prediction_service.get_risk_timeline(days=days)
    return BaseResponse(data=data, message="Flood risk timeline retrieved")

@router.get("/risk-map", response_model=BaseResponse[List[Dict[str, Any]]])
def get_risk_map():
    data = flood_prediction_service.get_risk_map()
    return BaseResponse(data=data, message="GIS station risk points retrieved")

@router.post("/predict", response_model=BaseResponse[Dict[str, Any]])
def predict_flood(input_data: FloodPredictInput):
    data = flood_prediction_service.predict_risk(input_data.dict())
    return BaseResponse(data=data, message="Flood risk prediction computed")

@router.post("/what-if", response_model=BaseResponse[Dict[str, Any]])
def what_if_simulation(input_data: WhatIfInput):
    baseline = input_data.baseline or {
        "daily_rainfall_mm": 50.0,
        "cum_3d_rainfall_mm": 110.0,
        "cum_7d_rainfall_mm": 210.0,
        "max_hourly_intensity": 20.0,
        "temperature_c": 28.0,
        "humidity_pct": 84.0,
        "surface_pressure_hpa": 1008.0
    }
    data = flood_prediction_service.what_if_simulation(baseline, input_data.rainfall_increase_pct)
    return BaseResponse(data=data, message="What-if simulation executed through trained model")
