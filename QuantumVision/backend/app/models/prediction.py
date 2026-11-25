"""
Hazard Risk Prediction Database Model.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime, timezone
from app.core.database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prediction_id = Column(String(50), unique=True, index=True, nullable=False)
    region_name = Column(String(100), index=True, nullable=False)
    disaster_type = Column(String(50), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    probability_score = Column(Float, nullable=False)
    quantum_risk_index = Column(Float, default=0.0)
    risk_level = Column(String(30), default="moderate")
    horizon_hours = Column(Integer, default=24)
    model_used = Column(String(100), default="Ensemble (XGBoost + QSVC)")
    feature_importance = Column(JSON, default=dict)
    weather_context = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
