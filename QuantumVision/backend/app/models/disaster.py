"""
Disaster and Hazard Event Database Model.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime, timezone
from app.core.database import Base

class DisasterEvent(Base):
    __tablename__ = "disaster_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    disaster_type = Column(String(50), index=True, nullable=False)  # fire, flood, earthquake, cyclone, etc.
    severity = Column(String(30), default="moderate", nullable=False)  # low, moderate, high, critical, extreme
    status = Column(String(30), default="active", index=True, nullable=False)  # active, resolved, evacuating
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=5.0)
    affected_population = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.95)
    quantum_confidence = Column(Float, default=0.92)
    detection_source = Column(String(100), default="Satellite / Drone CV Hybrid")
    description = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
