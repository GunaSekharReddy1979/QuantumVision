"""
QuantumVision Alert Entity Model for Flood Hazards & Early Warning.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime, timezone
from app.core.database import Base


class AlertRecord(Base):
    __tablename__ = "flood_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(60), index=True, nullable=False)
    severity = Column(String(30), index=True, default="Moderate", nullable=False)  # Critical, High, Moderate, Low, Informational
    classification = Column(String(40), index=True, default="MODEL_ESTIMATED", nullable=False)  # OFFICIAL, OBSERVED, MODEL_ESTIMATED, SIMULATED
    
    # Geographic location
    location_id = Column(String(60), index=True, default="all", nullable=False)
    location_name = Column(String(150), nullable=False)
    mandal = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Description & Conditions
    description = Column(Text, nullable=False)
    trigger_condition = Column(String(250), nullable=True)
    source = Column(String(120), nullable=False)
    source_event_id = Column(String(80), nullable=True)
    
    # Risk and Models
    risk_score = Column(Float, nullable=True)
    model_version = Column(String(80), nullable=True)
    recommended_action = Column(Text, nullable=True)
    
    # Routing & Accessibility
    evacuation_route_id = Column(String(80), nullable=True)
    affected_road_segments = Column(Text, nullable=True)  # JSON or comma-separated names
    
    # Status & Lifecycle
    status = Column(String(30), index=True, default="Active", nullable=False)  # Active, Acknowledged, Resolved, Expired
    observation_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    valid_until = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Auditing timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

