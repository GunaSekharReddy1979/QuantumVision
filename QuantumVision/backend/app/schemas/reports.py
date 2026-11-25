"""
Report Generation Pydantic Schemas.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ReportGenerateRequest(BaseModel):
    disaster_event_id: Optional[str] = None
    report_title: str = "Situation Assessment & Disaster Response Summary"
    include_quantum_analysis: bool = True
    include_evacuation_metrics: bool = True
    include_infrastructure_damage: bool = True
    format: str = "json"  # json, markdown, html

class DisasterReportResponse(BaseModel):
    report_id: str
    generated_at: str
    title: str
    executive_summary: str
    total_casualties: int
    infrastructure_damage_index: float
    evacuated_citizens_count: int
    shelter_utilization_pct: float
    quantum_accuracy_gain_pct: float
    recommended_recovery_actions: List[str]
    raw_content: Optional[str] = None
