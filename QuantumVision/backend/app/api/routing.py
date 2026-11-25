"""
Dynamic Evacuation Routing API Router.
Supports:
- POST /api/routing/compute (Primary computation endpoint)
- POST /api/routing/route (Alias)
- POST /api/routing/alternatives
- POST /api/routing/recalculate
- GET /api/routing/status
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from app.core.logger import logger
from app.schemas.common import BaseResponse
from app.schemas.route import RouteRequest, RouteAlternativeResponse, RouteExplainRequest
from app.services.routing_service import routing_service

router = APIRouter(prefix="/api/routing", tags=["Evacuation Routing"])

@router.post("/compute", response_model=BaseResponse[RouteAlternativeResponse])
@router.post("/route", response_model=BaseResponse[RouteAlternativeResponse])
def compute_route(req: RouteRequest):
    try:
        res = routing_service.calculate_route(req)
        return BaseResponse(data=res, message="Flood-aware evacuation route computed successfully")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Route computation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compute route: {str(e)}")

@router.post("/alternatives", response_model=BaseResponse[RouteAlternativeResponse])
def get_alternatives(req: RouteRequest):
    try:
        req.max_alternatives = max(1, req.max_alternatives)
        res = routing_service.calculate_route(req)
        return BaseResponse(data=res, message="Alternative evacuation routes computed successfully")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Alternatives computation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compute alternatives: {str(e)}")

@router.post("/explain", response_model=BaseResponse[Dict[str, Any]])
def explain_route(req: RouteExplainRequest):
    res = {
        "route_id": req.route_id,
        "algorithm": "A* Dynamic Flood Avoidance",
        "rationale": "Selected corridor maximizes distance from Nagavali & Vamsadhara river floodplains while minimizing transit latency to high-capacity evacuation centers."
    }
    return BaseResponse(data=res, message="Route explanation generated")

@router.post("/recalculate", response_model=BaseResponse[RouteAlternativeResponse])
def recalculate_route(req: RouteRequest):
    try:
        res = routing_service.calculate_route(req)
        return BaseResponse(data=res, message="Route dynamically recalculated with updated flood conditions.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Recalculation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to recalculate route: {str(e)}")

@router.get("/status", response_model=BaseResponse[Dict[str, Any]])
def get_routing_status():
    return BaseResponse(data=routing_service.get_status(), message="Routing engine status retrieved")
