"""
Navigation and Route Optimization API Endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.navigation import NavigationRouteRequest, NavigationRouteResponse
from app.schemas.common import BaseResponse
from app.services.navigation_service import navigation_service

router = APIRouter(prefix="/api/navigation", tags=["Navigation & Route Optimization"])

@router.post("/route", response_model=BaseResponse[NavigationRouteResponse])
def calculate_route(req: NavigationRouteRequest, db: Session = Depends(get_db)):
    result = navigation_service.calculate_evacuation_route(db, req)
    return BaseResponse(data=result, message="Evacuation route computed successfully")
