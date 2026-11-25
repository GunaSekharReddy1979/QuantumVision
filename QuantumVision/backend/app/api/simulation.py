"""
Flood Scenario Simulation API Endpoints.
Supports:
- POST /api/simulation/run (Dynamic flood scenario simulation: Current State vs. Simulated State)
- GET /api/simulation/{simulation_id}
- Time-stepped simulation lifecycle endpoints
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.schemas.common import BaseResponse
from app.schemas.simulation import SimulationCreateRequest, SimulationState, SimulationRecalculateRequest
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/api/simulation", tags=["Flood Simulation"])

class FloodScenarioRunRequest(BaseModel):
    scenario_name: Optional[str] = "Heavy Rainfall"
    location: Optional[str] = "Srikakulam District"
    rainfall_intensity_mm_hr: Optional[float] = 75.0
    duration_hours: Optional[float] = 6.0
    accumulated_rainfall_mm: Optional[float] = None
    flood_depth_m: Optional[float] = 1.2
    water_level_increase_m: Optional[float] = 0.8
    affected_area_multiplier: Optional[float] = 1.0
    road_closure_pct: Optional[float] = 25.0
    shelter_capacity_modifier_pct: Optional[float] = -15.0
    terrain_data: Optional[str] = "DEM (Elevation)"
    time_steps: Optional[int] = 6
    simulation_time: Optional[str] = "Now"

@router.post("/run", response_model=BaseResponse[Dict[str, Any]])
def run_simulation(req: FloodScenarioRunRequest):
    result = simulation_service.run_flood_scenario(
        scenario_name=req.scenario_name or "Heavy Rainfall",
        location=req.location or "Srikakulam District",
        rainfall_intensity_mm_hr=req.rainfall_intensity_mm_hr if req.rainfall_intensity_mm_hr is not None else 75.0,
        duration_hours=req.duration_hours if req.duration_hours is not None else 6.0,
        accumulated_rainfall_mm=req.accumulated_rainfall_mm,
        flood_depth_m=req.flood_depth_m if req.flood_depth_m is not None else 1.2,
        water_level_increase_m=req.water_level_increase_m if req.water_level_increase_m is not None else 0.8,
        affected_area_multiplier=req.affected_area_multiplier if req.affected_area_multiplier is not None else 1.0,
        road_closure_pct=req.road_closure_pct if req.road_closure_pct is not None else 25.0,
        shelter_capacity_modifier_pct=req.shelter_capacity_modifier_pct if req.shelter_capacity_modifier_pct is not None else -15.0,
        terrain_data=req.terrain_data or "DEM (Elevation)",
        time_steps=req.time_steps or 6,
        simulation_time=req.simulation_time or "Now"
    )
    return BaseResponse(data=result, message="Flood scenario simulation executed successfully")

@router.post("/create", response_model=BaseResponse[Dict[str, Any]])
def create_simulation(req: SimulationCreateRequest):
    res = simulation_service.run_flood_scenario()
    return BaseResponse(data=res, message="Simulation session initiated")

@router.post("/{simulation_id}/step", response_model=BaseResponse[Dict[str, Any]])
def step_simulation(simulation_id: str, payload: Optional[dict] = None):
    advance_steps = 1
    if payload and isinstance(payload, dict):
        advance_steps = payload.get("advance_steps", 1)
    res = simulation_service.step(simulation_id, advance_steps=advance_steps)
    return BaseResponse(data=res, message="Simulation step advanced")

@router.post("/{simulation_id}/reset", response_model=BaseResponse[Dict[str, Any]])
def reset_simulation(simulation_id: str):
    res = simulation_service.reset(simulation_id)
    return BaseResponse(data=res, message="Simulation reset to step 0")

@router.get("/{simulation_id}", response_model=BaseResponse[Dict[str, Any]])
def get_simulation(simulation_id: str):
    res = simulation_service.get_simulation_result(simulation_id)
    if not res:
        # Fallback to freshly generated run if ID not in memory
        res = simulation_service.run_flood_scenario()
    return BaseResponse(data=res, message="Simulation details retrieved")


