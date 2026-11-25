"""
Situation Assessment & Reports API Endpoints.
Supports:
- GET /api/reports/summary (Comprehensive flood operational and analytical report)
- POST /api/reports/generate (Custom situation report generator)
"""
from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.reports import ReportGenerateRequest, DisasterReportResponse
from app.schemas.common import BaseResponse
from app.services.reports_service import reports_service
from app.services.digital_twin_service import digital_twin_service
from app.services.quantum_service import quantum_service

router = APIRouter(prefix="/api/reports", tags=["Reports & Assessment"])

@router.get("/summary", response_model=BaseResponse[Dict[str, Any]])
def get_reports_summary():
    twin_sum = digital_twin_service.get_digital_twin_summary()
    benchmarks = quantum_service.get_classical_vs_quantum_comparison()

    summary_data = {
        "report_id": "RPT-SRK-FLOOD-2026",
        "title": "QuantumVision Flood Disaster Management & Evacuation Readiness Report",
        "region": "Srikakulam District, Andhra Pradesh, India",
        "timestamp": "2026-10-03T21:45:00Z",
        "overview": twin_sum,
        "flood_extent_analysis": {
            "inundation_area_km2": 42.8,
            "vulnerable_mandals": ["Srikakulam Rural", "Gara", "Polaki", "Narasannapeta", "Hiramandalam"],
            "river_basins_affected": ["Nagavali River Basin", "Vamsadhara Lowlands"],
            "water_level_above_danger_mark_m": 0.45
        },
        "transportation_and_roads": {
            "monitored_arterials_km": 1280.5,
            "submerged_segments_count": 14,
            "blocked_corridors": ["SH-101 Temburu-Hiramandalam Causeway", "Calingapatnam Coastal Spur"],
            "evacuation_passability_pct": 89.2
        },
        "shelter_and_healthcare_readiness": {
            "total_registered_facilities": 254,
            "active_evacuation_shelters": 28,
            "total_bed_capacity": 14200,
            "current_occupancy": 3840,
            "available_surge_capacity": 10360,
            "utilization_pct": 27.0
        },
        "ai_and_quantum_model_benchmarks": benchmarks
    }
    return BaseResponse(data=summary_data, message="Comprehensive flood analysis report retrieved")

@router.post("/generate", response_model=BaseResponse[DisasterReportResponse])
def generate_situation_report(req: ReportGenerateRequest):
    result = reports_service.generate_report(req)
    return BaseResponse(data=result, message="Situation assessment report generated successfully")
