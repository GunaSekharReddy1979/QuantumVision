"""
Pydantic Schemas for Flood Alerts & Early Warning.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AlertSchema(BaseModel):
    id: int
    alert_id: str
    title: str
    category: str
    severity: str
    classification: str
    location_id: str
    location_name: str
    mandal: str
    latitude: float
    longitude: float
    description: str
    trigger_condition: Optional[str] = None
    source: str
    source_event_id: Optional[str] = None
    risk_score: Optional[float] = None
    model_version: Optional[str] = None
    recommended_action: Optional[str] = None
    evacuation_route_id: Optional[str] = None
    affected_road_segments: Optional[str] = None
    status: str
    observation_time: datetime
    valid_until: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertSummary(BaseModel):
    critical_count: int
    high_risk_count: int
    active_warnings_count: int
    areas_requiring_attention_count: int
    total_active: int
    acknowledged_count: int
    resolved_count: int
    last_updated: datetime


class AlertAcknowledgeRequest(BaseModel):
    acknowledged_by: Optional[str] = "EOC Duty Officer"


class AlertResolveRequest(BaseModel):
    resolved_by: Optional[str] = "EOC Incident Commander"
    resolution_note: Optional[str] = "Hazard condition inspected and cleared."

