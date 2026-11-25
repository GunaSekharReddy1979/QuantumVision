def test_list_datasets(client):
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 1

def test_get_dataset_by_id(client):
    response = client.get("/api/datasets/ds-ap-boundary")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["id"] == "ds-ap-boundary"

def test_validate_dataset(client):
    payload = {"dataset_id": "ds-ap-boundary"}
    response = client.post("/api/datasets/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["valid"] is True
