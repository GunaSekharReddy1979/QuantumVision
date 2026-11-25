def test_predict_risk(client):
    payload = {
        "latitude": 16.5062,
        "longitude": 80.6480,
        "hazard_type": "combined",
        "features": {
            "rainfall_mm": 120.0,
            "elevation_m": 15.0,
            "wind_speed_kmh": 65.0
        }
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert 0.0 <= data["data"]["risk_score"] <= 1.0
    assert data["data"]["risk_category"] in ["Low", "Moderate", "High", "Critical"]

def test_explain_risk(client):
    payload = {"latitude": 16.5062, "longitude": 80.6480, "hazard_type": "combined"}
    response = client.post("/api/risk/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]["top_contributing_features"]) >= 1
