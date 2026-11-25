"""
FastAPI Endpoints for Flood Alerts & Early Warning System.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.alert import AlertSchema, AlertSummary, AlertAcknowledgeRequest, AlertResolveRequest
from app.schemas.common import BaseResponse
from app.services.alert_service import alert_service

router = APIRouter(prefix="/api/alerts", tags=["Flood Alerts & Early Warning"])


@router.get("", response_model=BaseResponse[List[AlertSchema]])
def list_alerts(
    location_id: Optional[str] = Query(None, description="Location ID to filter by, e.g. srk_town"),
    severity: Optional[str] = Query(None, description="Severity: Critical, High, Moderate, Low, Informational"),
    category: Optional[str] = Query(None, description="Category filter"),
    status: Optional[str] = Query(None, description="Status: Active, Acknowledged, Resolved, Expired"),
    classification: Optional[str] = Query(None, description="OFFICIAL, OBSERVED, MODEL_ESTIMATED, SIMULATED"),
    search: Optional[str] = Query(None, description="Text search across title, description, mandal"),
    sort_by: Optional[str] = Query("newest", description="newest, severity, location"),
    include_simulated: bool = Query(True, description="Whether to include simulated alerts"),
    db: Session = Depends(get_db)
):
    """Retrieves all flood alerts matching the specified query criteria."""
    alerts = alert_service.get_alerts(
        db=db,
        location_id=location_id,
        severity=severity,
        category=category,
        status=status,
        classification=classification,
        search=search,
        sort_by=sort_by,
        include_simulated=include_simulated
    )
    return BaseResponse(
        data=[AlertSchema.from_orm(a) for a in alerts],
        message=f"Retrieved {len(alerts)} alerts matching filter"
    )


@router.get("/summary", response_model=BaseResponse[AlertSummary])
def get_alerts_summary(
    location_id: Optional[str] = Query(None, description="Location ID filter"),
    db: Session = Depends(get_db)
):
    """Calculates active alert counts and urgency indices."""
    summary = alert_service.get_summary(db=db, location_id=location_id)
    return BaseResponse(data=summary, message="Alert summary counts computed successfully")


@router.get("/notifications", response_model=BaseResponse[List[AlertSchema]])
def get_notifications(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Retrieves recent active notifications for the top navbar bell."""
    notifications = alert_service.get_notifications(db=db, limit=limit)
    return BaseResponse(
        data=[AlertSchema.from_orm(n) for n in notifications],
        message="Active alert notifications retrieved"
    )


@router.get("/{alert_id}", response_model=BaseResponse[AlertSchema])
def get_alert_detail(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves full dossier for a specific alert ID."""
    alert = alert_service.get_alert_by_id(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert '{alert_id}' not found in active catalog"
        )
    return BaseResponse(data=AlertSchema.from_orm(alert), message="Alert details retrieved")


@router.post("/{alert_id}/acknowledge", response_model=BaseResponse[AlertSchema])
def acknowledge_alert(
    alert_id: str,
    req: AlertAcknowledgeRequest = AlertAcknowledgeRequest(),
    db: Session = Depends(get_db)
):
    """Acknowledges an alert by an operational user without resolving it."""
    alert = alert_service.acknowledge_alert(
        db=db,
        alert_id=alert_id,
        acknowledged_by=req.acknowledged_by or "EOC Duty Officer"
    )
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert '{alert_id}' could not be acknowledged"
        )
    return BaseResponse(
        data=AlertSchema.from_orm(alert),
        message=f"Alert {alert_id} acknowledged by {alert.acknowledged_by}"
    )


@router.post("/{alert_id}/resolve", response_model=BaseResponse[AlertSchema])
def resolve_alert(
    alert_id: str,
    req: AlertResolveRequest = AlertResolveRequest(),
    db: Session = Depends(get_db)
):
    """Resolves an alert when hazard has cleared."""
    alert = alert_service.resolve_alert(
        db=db,
        alert_id=alert_id,
        resolved_by=req.resolved_by or "EOC Commander",
        resolution_note=req.resolution_note or ""
    )
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert '{alert_id}' could not be resolved"
        )
    return BaseResponse(
        data=AlertSchema.from_orm(alert),
        message=f"Alert {alert_id} resolved by {alert.resolved_by}"
    )


@router.post("/refresh", response_model=BaseResponse[List[AlertSchema]])
def refresh_alerts(
    location_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Forces re-evaluation of rainfall forecast, CWC levels, and ML risk scores."""
    alerts = alert_service.refresh_alerts_from_live_modules(db=db, location_id=location_id)
    return BaseResponse(
        data=[AlertSchema.from_orm(a) for a in alerts],
        message="Alert catalog refreshed with latest meteorological and hydrological data"
    )

