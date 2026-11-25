"""
Disaster Detection and Event Management API Endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.disaster import DisasterDetectionRequest, DisasterDetectionResponse, DisasterEventCreate, DisasterEventResponse
from app.schemas.common import BaseResponse
from app.services.disaster_service import disaster_service

router = APIRouter(prefix="/api/disaster", tags=["Disaster Detection & Events"])

@router.post("/detect", response_model=BaseResponse[DisasterDetectionResponse])
def detect_disaster(req: DisasterDetectionRequest):
    result = disaster_service.detect_disaster(req)
    return BaseResponse(data=result, message="Disaster detection analysis completed")

@router.get("/events", response_model=BaseResponse[List[DisasterEventResponse]])
def list_disaster_events(status: Optional[str] = None, db: Session = Depends(get_db)):
    events = disaster_service.list_events(db, status_filter=status)
    return BaseResponse(data=[DisasterEventResponse.from_orm(e) for e in events])

@router.post("/events", response_model=BaseResponse[DisasterEventResponse])
def create_disaster_event(req: DisasterEventCreate, db: Session = Depends(get_db)):
    event = disaster_service.create_event(db, req)
    return BaseResponse(data=DisasterEventResponse.from_orm(event), message="Disaster event registered successfully")
