from typing import Dict, Any
from app.schemas.risk import RiskPredictRequest, RiskPredictionResponse, RiskExplanation

class RiskService:
    def predict(self, req: RiskPredictRequest) -> RiskPredictionResponse:
        """
        Transparent rule-based risk baseline.
        In Phase 10, this will use ML models if available.
        """
        lat = req.latitude
        lon = req.longitude
        features = req.features or {}
        
        # Rule-based calculation
        score = 0.0
        explanations = []
        
        # Example rule for rainfall
        rainfall = features.get("rainfall_mm", 0.0)
        if rainfall > 100:
            score += 0.4
            explanations.append(RiskExplanation(
                method="rule-based",
                feature_name="rainfall",
                feature_value=rainfall,
                contribution=0.4,
                explanation_text="The estimated risk increased because the supplied rainfall value was high relative to the configured rule threshold."
            ))
        elif rainfall > 0:
            score += 0.1
            explanations.append(RiskExplanation(
                method="rule-based",
                feature_name="rainfall",
                feature_value=rainfall,
                contribution=0.1,
                explanation_text="Moderate rainfall slightly increased the risk score."
            ))
            
        # Example rule for coastal proximity
        dist_to_coast = (84.0 - lon) * 111.0 # rough approx
        if dist_to_coast < 20:
            score += 0.5
            explanations.append(RiskExplanation(
                method="rule-based",
                feature_name="coastal_proximity",
                feature_value=max(0.0, dist_to_coast),
                contribution=0.5,
                explanation_text="High coastal exposure significantly increases baseline risk."
            ))
            
        score = min(1.0, score)
        
        if score > 0.7:
            category = "High"
        elif score > 0.3:
            category = "Moderate"
        else:
            category = "Low"
            
        return RiskPredictionResponse(
            location={"latitude": lat, "longitude": lon},
            hazard_type=req.hazard_type,
            risk_score=score,
            risk_category=category,
            model_method="rule-based baseline",
            explanations=explanations
        )

risk_service = RiskService()
