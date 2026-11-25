def test_list_facilities(client):
    response = client.get("/api/facilities")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 3

def test_nearby_facilities(client):
    response = client.get("/api/facilities/nearby?lat=16.5062&lon=80.6480&radius_km=40.0")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 1

def test_recommend_facility(client):
    payload = {
        "user_latitude": 16.5062,
        "user_longitude": 80.6480,
        "facility_type": "shelter"
    }
    response = client.post("/api/facilities/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["type"] == "shelter"
