"""
Hospital and Medical Facility Database Model.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from datetime import datetime, timezone
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hospital_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    icu_beds_total = Column(Integer, default=50)
    icu_beds_available = Column(Integer, default=12)
    general_beds_total = Column(Integer, default=200)
    general_beds_available = Column(Integer, default=45)
    blood_bank_status = Column(String(30), default="OPERATIONAL")
    trauma_level = Column(String(30), default="Level 1")
    is_operational = Column(Boolean, default=True)
    status = Column(String(30), default="OPERATIONAL")
    contact_phone = Column(String(50), default="911-HOSPITAL")
    equipment_status = Column(JSON, default=lambda: {"ventilators": 25, "oxygen_tanks": "95%", "ambulances_active": 8})
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
