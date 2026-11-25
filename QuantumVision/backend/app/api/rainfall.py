"""
QuantumVision Rainfall Forecasting API Endpoints.
Provides dual-mode next-24-hour rainfall forecasting (Provider Forecast vs Local ML Prediction),
model training and evaluation endpoints, and Srikakulam representative geographic points.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel

from app.schemas.common import BaseResponse
from app.core.geo_config import district_geo_manager
from app.services.rainfall_forecasting_service import rainfall_forecasting_service, METRICS_PATH

router = APIRouter(prefix="/api/rainfall", tags=["Rainfall Forecasting"])

class ModelTrainRequest(BaseModel):
    force_retrain: Optional[bool] = False

@router.get("/forecast", response_model=BaseResponse[Dict[str, Any]])
def get_rainfall_forecast(
    hours: int = Query(24, ge=6, le=72, description="Forecast horizon in hours (6-72, default 24)"),
    location_id: Optional[str] = Query(None, description="Specific location point ID or None for all district points"),
    mode: str = Query("both", pattern="^(provider|ml|both)$", description="Inference mode: 'provider', 'ml', or 'both'")
):
    """
    Retrieves operational next-24-hour rainfall forecast:
    - Mode 'provider': Open-Meteo direct forecast
    - Mode 'ml': Local Random Forest / XGBoost model predictions (leak-free features)
    - Mode 'both': Side-by-side comparative forecast with district spatial aggregate
    """
    try:
        data = rainfall_forecasting_service.get_rainfall_forecast(
            location_id=location_id,
            hours=hours,
            mode=mode
        )
        return BaseResponse(
            data=data,
            data_mode="FORECAST",
            source="Open-Meteo & QuantumVision ML Regression Pipeline",
            message=f"Rainfall forecast ({mode.upper()} mode) retrieved successfully."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rainfall forecast generation failed: {str(e)}"
        )

@router.get("/model/status", response_model=BaseResponse[Dict[str, Any]])
def get_model_status():
    """Returns status of trained rainfall models, artifacts, and feature lists."""
    try:
        data = rainfall_forecasting_service.get_model_status()
        return BaseResponse(
            data=data,
            data_mode="MODEL_DERIVED",
            message="Rainfall model status retrieved successfully."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model status: {str(e)}"
        )

@router.post("/model/train", response_model=BaseResponse[Dict[str, Any]])
def train_rainfall_models(req: Optional[ModelTrainRequest] = None):
    """
    Triggers chronological training and evaluation of Baseline, Random Forest, and XGBoost models.
    Prevents concurrent training requests.
    """
    force = req.force_retrain if req else False
    try:
        report = rainfall_forecasting_service.train_models(force_retrain=force)
        if report.get("status") == "BUSY":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=report["message"]
            )
        return BaseResponse(
            data=report,
            data_mode="MODEL_DERIVED",
            message="Rainfall forecasting models trained and evaluated successfully."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )

@router.get("/model/evaluation", response_model=BaseResponse[Dict[str, Any]])
def get_model_evaluation():
    """
    Returns genuine evaluation metrics (MAE, RMSE, R², heavy-rain evaluation)
    comparing Baseline, Random Forest, XGBoost, and Quantum Integration status.
    """
    metrics = rainfall_forecasting_service.evaluation_metrics
    if not metrics:
        return BaseResponse(
            data={
                "status": "NOT_EVALUATED",
                "message": "Models not yet evaluated. Run /api/rainfall/model/train to evaluate."
            },
            data_mode="MODEL_DERIVED",
            message="No evaluation metrics recorded yet."
        )
    return BaseResponse(
        data=metrics,
        data_mode="MODEL_DERIVED",
        message="Model evaluation metrics retrieved successfully."
    )

@router.get("/locations", response_model=BaseResponse[Dict[str, Any]])
def get_weather_locations():
    """
    Returns configured representative weather-grid points for Srikakulam District
    along with district boundary metadata, bounding box, and hydrological details.
    """
    points = district_geo_manager.get_weather_points()
    metadata = district_geo_manager.get_district_metadata()
    return BaseResponse(
        data={
            "metadata": metadata,
            "locations": points
        },
        data_mode="RULE_BASED",
        message="Configured Srikakulam weather points retrieved successfully."
    )
