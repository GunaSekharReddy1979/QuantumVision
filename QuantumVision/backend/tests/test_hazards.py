def test_get_flood_hazard(client):
    response = client.get("/api/hazards/flood")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "hazard_level" in data["data"]

def test_analyze_flood(client):
    payload = {"latitude": 16.5062, "longitude": 80.6480, "radius_km": 20.0}
    response = client.post("/api/hazards/flood/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "flood_risk_level" in data["data"]

