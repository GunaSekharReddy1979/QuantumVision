"""
QuantumVision Main FastAPI Application Entrypoint.
"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn

# Add backend and root to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
for p in [ROOT_DIR, BACKEND_DIR, BASE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.core.config import settings
from app.core.logger import logger
from app.core.database import Base, engine, check_db_connection
from app.core.middleware import setup_middleware
from app.core.exceptions import setup_exception_handlers

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
from app.api.dataset import router as dataset_router
from app.api.health import router as health_router
from app.api.locations import router as locations_router
from app.api.map import router as map_router
from app.api.hazards import router as hazards_router
from app.api.risk import router as risk_router
from app.api.explainability import router as explainability_router
from app.api.facilities import router as facilities_router
from app.api.flood import router as flood_router
from app.api.models import router as models_router
from app.api.routing import router as routing_router
from app.api.flood_prediction import router as flood_prediction_router
from app.api.weather import router as weather_router
from app.api.rainfall import router as rainfall_router
from app.api.alerts import router as alerts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and quantum simulation core on startup."""
    logger.info("Starting QuantumVision Backend Services...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas initialized.")
    except Exception as e:
        logger.warning(f"Database schema initialization note: {e}")
    logger.info(f"Quantum Backend Initialized: {settings.QUANTUM_BACKEND} ({settings.NUM_QUBITS} Qubits)")
    yield
    logger.info("Shutting down QuantumVision Backend Services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Apply CORS and Security Middleware
setup_middleware(app)

# Register Exception Handlers
setup_exception_handlers(app)

# Mount all Routers
app.include_router(auth_router)
app.include_router(disaster_router)
app.include_router(dataset_router)
app.include_router(prediction_router)
app.include_router(simulation_router)
app.include_router(navigation_router)
app.include_router(quantum_router)
app.include_router(visualization_router)
app.include_router(emergency_router)
app.include_router(shelter_router)
app.include_router(hospital_router)
app.include_router(reports_router)
app.include_router(websocket_router)
app.include_router(health_router)
app.include_router(locations_router)
app.include_router(map_router)
app.include_router(hazards_router)
app.include_router(risk_router)
app.include_router(explainability_router)
app.include_router(facilities_router)
app.include_router(routing_router)
app.include_router(flood_router)
app.include_router(models_router)
app.include_router(flood_prediction_router)
app.include_router(weather_router)
app.include_router(rainfall_router)
app.include_router(alerts_router)



@app.get("/", tags=["System"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "quantum_ready": True
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
