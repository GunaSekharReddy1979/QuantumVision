"""
API Routers Export.
"""
from app.api.auth import router as auth_router
from app.api.disaster import router as disaster_router
from app.api.prediction import router as prediction_router
from app.api.simulation import router as simulation_router
from app.api.navigation import router as navigation_router
from app.api.quantum import router as quantum_router
from app.api.visualization import router as visualization_router
from app.api.emergency import router as emergency_router
from app.api.shelter import router as shelter_router
from app.api.hospital import router as hospital_router
from app.api.reports import router as reports_router
from app.api.websocket import router as websocket_router
from app.api.locations import router as locations_router
from app.api.map import router as map_router
from app.api.hazards import router as hazards_router
from app.api.risk import router as risk_router
from app.api.explainability import router as explainability_router
from app.api.facilities import router as facilities_router
from app.api.routing import router as routing_router

__all__ = [
    "auth_router",
    "disaster_router",
    "prediction_router",
    "simulation_router",
    "navigation_router",
    "quantum_router",
    "visualization_router",
    "emergency_router",
    "shelter_router",
    "hospital_router",
    "reports_router",
    "websocket_router",
    "locations_router",
    "map_router",
    "hazards_router",
    "risk_router",
    "explainability_router",
    "facilities_router",
    "routing_router"
]
