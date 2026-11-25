"""
Emergency SOS and Responder Dispatch API Endpoints.
"""
from fastapi import APIRouter
from app.schemas.emergency import SOSAlertCreate, SOSAlertResponse
from app.schemas.common import BaseResponse
from app.services.emergency_service import emergency_service

router = APIRouter(prefix="/api/emergency", tags=["Emergency Response & SOS"])

@router.post("/sos", response_model=BaseResponse[SOSAlertResponse])
def trigger_sos(req: SOSAlertCreate):
    result = emergency_service.dispatch_sos(req)
    return BaseResponse(data=result, message="Emergency SOS alert dispatched to rescue network")
