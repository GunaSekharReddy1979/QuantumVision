from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class QuantumOptimizeRouteRequest(BaseModel):
    origin: Dict[str, float]
    destination: Dict[str, float]
    waypoints: List[Dict[str, float]] = []

class QuantumSelectFacilityRequest(BaseModel):
    user_location: Dict[str, float]
    available_facilities: List[str]

class QuantumCompareRequest(BaseModel):
    problem_type: str  # "route" or "facility"
    problem_data: Dict[str, Any]

class QuantumOptimizationResponse(BaseModel):
    method: str
    solution: Any
    is_quantum: bool
    runtime_ms: Optional[float] = None
    solution_quality: Optional[float] = None
    fallback_used: bool = False

class QuantumComparisonResponse(BaseModel):
    quantum_result: QuantumOptimizationResponse
    classical_result: QuantumOptimizationResponse
    speedup_factor: Optional[float] = None
    quality_diff: Optional[float] = None
