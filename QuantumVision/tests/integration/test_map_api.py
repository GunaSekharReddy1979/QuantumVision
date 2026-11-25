"""
Integration Test: Map API data consistency and GeoJSON structure verification.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

client = TestClient(app)

def test_map_hazards_geojson_contract():
    # Srikakulam Town Old Bridge coordinate
    res = client.post("/api/hazards/flood/analyze", json={"latitude": 18.2969, "longitude": 83.8968, "radius_km": 20.0})
    assert res.status_code == 200
    data = res.json()["data"]
    assert "hazard_level" in data
    assert "water_level_m" in data

def test_map_routing_geojson_contract():
    payload = {
        "origin_latitude": 18.2969,
        "origin_longitude": 83.8968,
        "destination_latitude": 18.3125,
        "destination_longitude": 83.9102,
        "algorithm": "A*"
    }
    res = client.post("/api/routing/route", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "primary" in data
    coords = data["primary"]["geometry"]["coordinates"]
    assert len(coords) >= 2
    # Ensure coordinates are [lon, lat] format for Cesium/GeoJSON standard
    first_wp = coords[0]
    assert len(first_wp) == 2
    assert 83.0 <= first_wp[0] <= 85.0  # lon (Srikakulam)
    assert 18.0 <= first_wp[1] <= 19.5  # lat (Srikakulam)