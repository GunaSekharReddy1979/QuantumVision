"""
Geospatial Visualization & Heatmaps API Endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.visualization import MapLayersRequest, MapLayersResponse
from app.schemas.common import BaseResponse
from app.services.visualization_service import visualization_service

router = APIRouter(prefix="/api/visualization", tags=["Geospatial Visualization"])

@router.post("/layers", response_model=BaseResponse[MapLayersResponse])
def get_map_layers(req: MapLayersRequest, db: Session = Depends(get_db)):
    result = visualization_service.get_map_layers(db, req)
    return BaseResponse(data=result, message="Geospatial map layers retrieved successfully")
