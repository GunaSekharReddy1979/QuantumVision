from fastapi import APIRouter
from app.core.database import check_db_connection
from app.schemas.common import BaseResponse, HealthStatusResponse

router = APIRouter(prefix="/api", tags=["System"])

@router.get("/health", response_model=BaseResponse[HealthStatusResponse])
def health_check():
    db_ok = check_db_connection()
    status_str = "healthy" if db_ok else "degraded"
    
    health_data = HealthStatusResponse(
        status=status_str,
        services={
            "database": "online" if db_ok else "degraded",
            "quantum_engine": "ready",
            "computer_vision": "ready",
            "simulation_core": "ready",
            "navigation_core": "ready",
            "websocket_telemetry": "ready"
        }
    )
    return BaseResponse(
        status="success" if db_ok else "warning",
        message="Health check completed",
        data=health_data,
        data_mode="LIVE"
    )
