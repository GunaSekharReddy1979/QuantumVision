"""
Integration Test: End-to-End API payload verification for Frontend consumption.
"""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

client = TestClient(app)

def test_frontend_health_contract():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert data["data"]["status"] == "healthy"

def test_frontend_districts_contract():
    res = client.get("/api/locations/districts")
    assert res.status_code == 200
    districts = res.json()["data"]
    assert len(districts) > 0
    first = districts[0]
    for key in ["id", "name", "latitude", "longitude"]:
        assert key in first