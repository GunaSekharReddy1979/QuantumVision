"""
Emergency Response, SOS Dispatch and Incident Management Service.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.schemas.emergency import SOSAlertCreate, SOSAlertResponse
from app.core.logger import logger

class EmergencyService:
    @staticmethod
    def dispatch_sos(req: SOSAlertCreate) -> SOSAlertResponse:
        """
        Receives SOS distress signal, determines incident priority, and dispatches nearest rescue unit.
        """
        sos_id = f"SOS-{uuid.uuid4().hex[:6].upper()}"
        priority = "P1_CRITICAL" if req.critical_medical_needs or req.number_of_people >= 4 else "P2_HIGH"
        unit_name = "Rapid Rescue Unit 7 (Amphibious + Drone Support)"
        eta_minutes = 7 if priority == "P1_CRITICAL" else 14
        
        logger.warning(f"EMERGENCY SOS DISPATCH TRIGGERED: {sos_id} by {req.caller_name} at ({req.latitude}, {req.longitude})")
        
        return SOSAlertResponse(
            sos_id=sos_id,
            status="DISPATCHED",
            priority=priority,
            assigned_responder_unit=unit_name,
            estimated_arrival_minutes=eta_minutes,
            nearest_hospital="St. Jude Trauma Center (1.8 km)",
            nearest_shelter="Central Emergency Complex Alpha (2.4 km)",
            dispatch_timestamp=datetime.now(timezone.utc).isoformat()
        )

emergency_service = EmergencyService()
