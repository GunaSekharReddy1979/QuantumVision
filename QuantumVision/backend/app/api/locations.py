from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.location import LocationInfo, DistrictInfo, LocationValidateRequest, LocationSelectRequest
from app.schemas.common import BaseResponse
from app.services.location_service import location_service

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.get("/districts", response_model=BaseResponse[List[DistrictInfo]])
def get_districts():
    districts = location_service.get_districts()
    return BaseResponse(data=districts, data_mode="RULE_BASED")

@router.get("/search", response_model=BaseResponse[List[dict]])
def search_locations(q: str = ""):
    results = location_service.search_locations(q)
    return BaseResponse(data=results, data_mode="RULE_BASED")


@router.post("/validate", response_model=BaseResponse[dict])
def validate_location(req: LocationValidateRequest):
    result = location_service.validate_coordinate(req.coordinate)
    if not result["valid"]:
        return BaseResponse(
            status="error",
            message="Coordinates are outside the supported region.",
            data=result,
            data_mode="RULE_BASED"
        )
    return BaseResponse(data=result, data_mode="RULE_BASED")

@router.post("/select", response_model=BaseResponse[LocationInfo])
def select_location(req: LocationSelectRequest):
    try:
        location = location_service.select_location(req)
        return BaseResponse(data=location, data_mode="RULE_BASED")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{location_id}", response_model=BaseResponse[LocationInfo])
def get_location(location_id: str):
    location = location_service.get_location_by_id(location_id)
    return BaseResponse(data=location, data_mode="RULE_BASED")
