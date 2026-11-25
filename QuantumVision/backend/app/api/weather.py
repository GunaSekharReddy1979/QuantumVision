"""
QuantumVision Weather API Endpoints.
Provides Open-Meteo operational weather forecasting and historical data synchronization
for Srikakulam District representative weather grid points.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel

from app.schemas.common import BaseResponse
from app.services.weather_service import weather_service

router = APIRouter(prefix="/api/weather", tags=["Weather Integration"])

class HistoricalSyncRequest(BaseModel):
    start_year: Optional[int] = 2021
    end_year: Optional[int] = 2025
    force: Optional[bool] = False

@router.get("/historical-status", response_model=BaseResponse[Dict[str, Any]])
def get_historical_status():
    """Returns status, record count, and data quality metrics for the historical weather archive."""
    try:
        data = weather_service.get_historical_status()
        return BaseResponse(
            data=data,
            data_mode="HISTORICAL",
            source="Open-Meteo Historical Weather Archive API",
            message="Historical weather archive status retrieved successfully."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve historical status: {str(e)}"
        )

@router.post("/historical/sync", response_model=BaseResponse[Dict[str, Any]])
def sync_historical_data(req: Optional[HistoricalSyncRequest] = None):
    """
    Triggers historical data acquisition and cleaning from Open-Meteo Archive API.
    Saves raw payloads to data/raw/weather/ and standardized series to data/processed/weather/.
    """
    start_yr = req.start_year if req else 2021
    end_yr = req.end_year if req else 2025
    force = req.force if req else False
    try:
        sync_result = weather_service.sync_historical_archive(
            start_year=start_yr,
            end_year=end_yr,
            force=force
        )
        return BaseResponse(
            data=sync_result,
            data_mode="HISTORICAL",
            source="Open-Meteo Historical Archive",
            message="Historical weather archive synchronization completed."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Historical sync failed: {str(e)}"
        )

@router.get("/forecast", response_model=BaseResponse[Dict[str, Any]])
def get_weather_forecast(
    location_id: Optional[str] = Query(None, description="Point identifier (e.g. srk_town) or empty for district"),
    hours: int = Query(24, ge=6, le=72, description="Forecast horizon in hours (6-72)"),
    refresh: bool = Query(False, description="Bypass cache and force immediate refresh from Open-Meteo")
):
    """
    Retrieves hourly weather forecast from Open-Meteo for the next N hours (default 24h).
    Returns hourly series, 24-hour total accumulation, and spatial district summary.
    """
    try:
        forecast_data = weather_service.get_forecast(
            location_id=location_id,
            hours=hours,
            force_refresh=refresh
        )
        is_stale = forecast_data.get("is_stale", False)
        return BaseResponse(
            data=forecast_data,
            data_mode="STALE" if is_stale else "FORECAST",
            source=forecast_data.get("provider", "Open-Meteo"),
            message="Weather forecast retrieved successfully." if not is_stale else "Warning: External API unavailable, returning cached forecast."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather forecast service error: {str(e)}"
        )
