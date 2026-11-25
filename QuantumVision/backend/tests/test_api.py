from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["status"] == "healthy"

def test_locations_districts():
    response = client.get("/api/locations/districts")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) > 0

def test_locations_validate_invalid():
    response = client.post("/api/locations/validate", json={"coordinate": {"latitude": 0, "longitude": 0}})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert data["data"]["valid"] == False

def test_hazards_flood_summary():
    response = client.get("/api/hazards/flood")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_hazards_flood_analyze():
    response = client.post("/api/hazards/flood/analyze", json={"latitude": 16.5, "longitude": 80.6})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "flood_risk_level" in data["data"]


def test_risk_predict():
    response = client.post("/api/risk/predict", json={"latitude": 16.5, "longitude": 80.6, "hazard_type": "flood", "features": {"rainfall_mm": 150.0}})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["risk_category"] == "Moderate"

def test_facilities_list():
    response = client.get("/api/facilities")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_routing_status():
    response = client.get("/api/routing/status")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_simulation_create():
    response = client.post("/api/simulation/create", json={"hazard_type": "flood", "start_time": "2026-08-01T00:00:00Z"})
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "simulation_id" in response.json()["data"]

def test_quantum_status():
    response = client.get("/api/quantum/status")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
