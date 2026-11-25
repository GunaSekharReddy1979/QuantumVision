"""
Emergency Shelter Database Model.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from datetime import datetime, timezone
from app.core.database import Base

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shelter_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    shelter_type = Column(String(50), default="Evacuation Center")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_capacity = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=0)
    is_open = Column(Boolean, default=True)
    status = Column(String(30), default="OPEN")  # OPEN, FULL, CLOSED
    contact_phone = Column(String(50), default="1-800-SHELTER")
    supplies_status = Column(JSON, default=lambda: {"food": "adequate", "water": "adequate", "medical": "good", "generators": "online"})
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
