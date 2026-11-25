"""
Predictive AI Hazard Risk Assessment API Endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.schemas.common import BaseResponse
from app.services.prediction_service import prediction_service

router = APIRouter(prefix="/api/prediction", tags=["Predictive AI"])

@router.post("/risk", response_model=BaseResponse[PredictionResponse])
def predict_hazard_risk(req: PredictionRequest, db: Session = Depends(get_db)):
    result = prediction_service.calculate_risk(db, req)
    return BaseResponse(data=result, message="Hazard risk prediction computed successfully")
