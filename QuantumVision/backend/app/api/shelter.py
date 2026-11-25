"""
Emergency Shelter Directory and Safe Selection API Endpoints.
Provides:
- Complete shelter registry
- Nearby safe shelter ranking (Multi-Criteria Score: Safety + Accessibility + Capacity + Route Reliability - Distance)
- Dynamic tooltips and capacity telemetry
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.shelter import ShelterResponse
from app.schemas.facility import FacilityNearbyRequest, ShelterRecommendation
from app.schemas.location import Coordinate
from app.schemas.common import BaseResponse
from app.services.shelter_service import shelter_service

router = APIRouter(prefix="/api/shelters", tags=["Safe Shelters"])

@router.get("", response_model=BaseResponse[List[ShelterResponse]])
@router.get("/list", response_model=BaseResponse[List[ShelterResponse]])
def list_all_shelters(db: Session = Depends(get_db)):
    results = shelter_service.list_shelters(db)
    return BaseResponse(data=results, message="Active emergency shelters retrieved successfully")

@router.get("/nearby", response_model=BaseResponse[List[ShelterRecommendation]])
def get_nearby_shelters_get(
    lat: float = Query(18.2969, description="User latitude"),
    lon: float = Query(83.8968, description="User longitude"),
    radius_km: float = Query(25.0, description="Search radius in kilometers")
):
    req = FacilityNearbyRequest(
        coordinate=Coordinate(latitude=lat, longitude=lon),
        radius_km=radius_km
    )
    recommendations = shelter_service.recommend_shelters(req)
    return BaseResponse(data=recommendations, message="Ranked nearby safe shelters retrieved")

@router.post("/nearby", response_model=BaseResponse[List[ShelterRecommendation]])
def get_nearby_shelters_post(req: FacilityNearbyRequest):
    recommendations = shelter_service.recommend_shelters(req)
    return BaseResponse(data=recommendations, message="Ranked nearby safe shelters retrieved")
