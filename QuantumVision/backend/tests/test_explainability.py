def test_explain_risk(client):
    payload = {"latitude": 16.5062, "longitude": 80.6480, "hazard_type": "combined"}
    response = client.post("/api/explainability/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "top_contributing_features" in data["data"]
    assert len(data["data"]["top_contributing_features"]) >= 2

def test_explain_route(client):
    payload = {"route_id": "rt-test-123"}
    response = client.post("/api/explainability/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "decision_factors" in data["data"]
