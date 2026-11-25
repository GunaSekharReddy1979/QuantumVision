from typing import List, Dict, Any
from fastapi import APIRouter
from app.schemas.common import BaseResponse
from app.schemas.hazard import HazardAnalyzeRequest, HazardLayerInfo, FloodAnalysisResponse
from app.services.flood_service import flood_service

router = APIRouter(prefix="/api/hazards", tags=["Hazards"])

# ================= Flood Endpoints =================

@router.get("/flood", response_model=BaseResponse[Dict[str, Any]])
def get_flood_summary():
    return BaseResponse(data=flood_service.get_summary(), data_mode="RULE_BASED")

@router.get("/flood/layers", response_model=BaseResponse[List[HazardLayerInfo]])
def get_flood_layers():
    return BaseResponse(data=flood_service.get_layers(), data_mode="RULE_BASED")

@router.post("/flood/analyze", response_model=BaseResponse[FloodAnalysisResponse])
def analyze_flood(req: HazardAnalyzeRequest):
    res = flood_service.analyze(req)
    return BaseResponse(data=res, data_mode="RULE_BASED")

