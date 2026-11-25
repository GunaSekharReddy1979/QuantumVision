"""
Simulation Run Record Database Model.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from datetime import datetime, timezone
from app.core.database import Base

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sim_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    simulation_type = Column(String(50), nullable=False)  # fire, flood, earthquake, cyclone, digital_twin
    engine_name = Column(String(100), default="Cellular Automata / Physics Hybrid")
    timesteps = Column(Integer, default=50)
    grid_size = Column(String(20), default="100x100")
    parameters = Column(JSON, default=dict)
    summary_stats = Column(JSON, default=dict)
    output_file = Column(String(255), nullable=True)
    status = Column(String(30), default="completed")  # running, completed, failed
    execution_time_sec = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
