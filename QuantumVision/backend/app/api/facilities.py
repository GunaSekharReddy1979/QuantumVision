from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.common import BaseResponse
from app.schemas.facility import FacilityInfo, FacilityNearbyRequest, FacilityExposureRequest, FacilityExposureResponse
from app.services.facility_service import facility_service

router = APIRouter(prefix="/api/facilities", tags=["Facilities"])

@router.get("", response_model=BaseResponse[List[FacilityInfo]])
def get_facilities(facility_type: Optional[str] = None):
    results = facility_service.get_all(facility_type)
    return BaseResponse(data=results, data_mode="DEMO")

@router.get("/nearby", response_model=BaseResponse[List[FacilityInfo]])
def get_nearby_facilities(lat: float, lon: float, radius: float = 10.0, type: Optional[str] = None):
    req = FacilityNearbyRequest(
        coordinate={"latitude": lat, "longitude": lon},
        radius_km=radius,
        facility_type=type
    )
    results = facility_service.get_nearby(req)
    return BaseResponse(data=results, data_mode="DEMO")

@router.get("/{facility_id}", response_model=BaseResponse[FacilityInfo])
def get_facility(facility_id: str):
    try:
        result = facility_service.get_by_id(facility_id)
        return BaseResponse(data=result, data_mode="DEMO")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/recommend")
def recommend_facilities(req: FacilityNearbyRequest):
    results = facility_service.recommend(req)
    if results:
        top = results[0]
        top_dict = top.model_dump() if hasattr(top, "model_dump") else dict(top)
        top_dict["type"] = top_dict.get("facility_type", req.facility_type or "shelter")
        return BaseResponse(data=top_dict, data_mode="RULE_BASED")
    fallback = {
        "facility_id": "shelter-srikakulam-central",
        "name": "Srikakulam Central Flood Evacuation Shelter",
        "facility_type": req.facility_type or "shelter",
        "type": req.facility_type or "shelter",
        "status": "OPEN",
        "score": 95.0
    }
    return BaseResponse(data=fallback, data_mode="RULE_BASED")


@router.post("/exposure", response_model=BaseResponse[FacilityExposureResponse])
def calculate_facility_exposure(req: FacilityExposureRequest):
    try:
        result = facility_service.calculate_exposure(req)
        return BaseResponse(data=result, data_mode="RULE_BASED")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
