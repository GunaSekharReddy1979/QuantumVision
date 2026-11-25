from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

class SimulationCreateRequest(BaseModel):
    hazard_type: str = "flood"
    start_time: Optional[str] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    time_step_hours: float = 1.0
    center_latitude: Optional[float] = 18.2969
    center_longitude: Optional[float] = 83.8968
    time_horizon_hours: Optional[int] = 24
    input_data: Dict[str, Any] = {}
    assumptions: List[str] = []

class SimulationState(BaseModel):
    simulation_id: str
    hazard_type: str = "flood"
    start_time: str
    current_time: str
    time_step: float = 1.0
    simulation_mode: str = "time-based progression"
    status: str = "running"
    assumptions: List[str] = []
    limitations: List[str] = []
    hazard_state: Dict[str, Any] = {}
    route_state: Dict[str, Any] = {}

class SimulationRecalculateRequest(BaseModel):
    route_id: str
