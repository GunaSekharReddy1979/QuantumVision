from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.common import BaseResponse
from app.schemas.quantum import QuantumOptimizeRouteRequest, QuantumSelectFacilityRequest, QuantumCompareRequest, QuantumOptimizationResponse, QuantumComparisonResponse
from app.services.quantum_service import quantum_service

router = APIRouter(prefix="/api/quantum", tags=["Quantum-Inspired Optimization"])

@router.get("/status", response_model=BaseResponse[Dict[str, Any]])
def get_quantum_status():
    res = quantum_service.get_status()
    return BaseResponse(data=res, data_mode="RULE_BASED")

@router.post("/optimize-route", response_model=BaseResponse[QuantumOptimizationResponse])
def optimize_route(req: QuantumOptimizeRouteRequest):
    res = quantum_service.optimize_route(req)
    return BaseResponse(data=res, data_mode="SIMULATED")

@router.post("/select-facility", response_model=BaseResponse[QuantumOptimizationResponse])
def select_facility(req: QuantumSelectFacilityRequest):
    res = quantum_service.select_facility(req)
    return BaseResponse(data=res, data_mode="SIMULATED")

@router.post("/compare", response_model=BaseResponse[QuantumComparisonResponse])
def compare_methods(req: QuantumCompareRequest):
    res = quantum_service.compare(req)
    return BaseResponse(data=res, data_mode="SIMULATED")
