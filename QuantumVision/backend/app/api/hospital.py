"""
Hospital and Medical Resource Monitoring API Endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.hospital import HospitalResponse
from app.schemas.common import BaseResponse
from app.services.hospital_service import hospital_service

router = APIRouter(prefix="/api/hospital", tags=["Hospitals & Medical Infrastructure"])

@router.get("/list", response_model=BaseResponse[List[HospitalResponse]])
def list_hospitals(db: Session = Depends(get_db)):
    results = hospital_service.list_hospitals(db)
    return BaseResponse(data=results, message="Hospital registry retrieved successfully")
