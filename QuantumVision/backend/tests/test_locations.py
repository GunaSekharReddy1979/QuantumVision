def test_get_districts(client):
    response = client.get("/api/locations/districts")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 10
    names = [d["name"] for d in data["data"]]
    assert any("Vijayawada" in name for name in names)

def test_search_locations(client):
    response = client.get("/api/locations/search?q=Visakhapatnam")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 1
    assert data["data"][0]["name"] == "Visakhapatnam"

def test_select_location(client):
    payload = {"district_id": "ntr", "place_name": "Benz Circle, Vijayawada"}
    response = client.post("/api/locations/select", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["district"]["id"] == "ntr"
