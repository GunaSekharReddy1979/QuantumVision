def test_create_simulation(client):
    payload = {
        "hazard_type": "flood",
        "center_latitude": 16.5062,
        "center_longitude": 80.6480,
        "time_horizon_hours": 24,
        "time_step_hours": 1
    }
    response = client.post("/api/simulation/create", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    sim_id = data["data"]["simulation_id"]
    assert sim_id.startswith("sim-")

    # Step simulation
    step_resp = client.post(f"/api/simulation/{sim_id}/step", json={"advance_steps": 2})
    assert step_resp.status_code == 200
    assert step_resp.json()["data"]["current_step"] == 2

    # Reset simulation
    reset_resp = client.post(f"/api/simulation/{sim_id}/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["data"]["current_step"] == 0
