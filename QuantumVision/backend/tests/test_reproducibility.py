"""
QuantumVision Deterministic Reproducibility & Consistency Test Suite.
Verifies that 5 consecutive runs of identical inputs produce 100% identical outputs
across ML prediction, Quantum (VQC/QNN) inference, A*/Dijkstra routing, and Hydrological simulation.
"""
import pytest
import numpy as np

from app.services.flood_prediction_service import flood_prediction_service
from app.services.quantum_service import quantum_service
from app.services.routing_service import routing_service
from app.services.simulation_service import simulation_service
from app.schemas.route import RouteRequest, Coordinate


def test_classical_flood_prediction_reproducibility_5_runs():
    """Verifies that 5 consecutive runs of Random Forest / XGBoost predictions yield identical results."""
    test_params = {
        "daily_rainfall_mm": 112.5,
        "prev_day_rainfall_mm": 84.0,
        "cum_3d_rainfall_mm": 240.0,
        "cum_7d_rainfall_mm": 395.0,
        "cum_14d_rainfall_mm": 510.0,
        "max_hourly_intensity": 42.0,
        "days_consecutive_rain": 4,
        "model": "xgboost"
    }

    results = []
    for run_idx in range(5):
        pred = flood_prediction_service.predict_risk(test_params)
        results.append(pred)

    # Assert exact consistency across all 5 runs
    base = results[0]
    for i, res in enumerate(results[1:], start=2):
        assert res["probability"] == base["probability"], f"Run {i} probability drifted: {res['probability']} vs {base['probability']}"
        assert res["risk_category"] == base["risk_category"], f"Run {i} risk category drifted"
        assert res["confidence"] == base["confidence"], f"Run {i} confidence drifted"
        assert res["model_used"] == base["model_used"], f"Run {i} model name drifted"


def test_quantum_prediction_reproducibility_5_runs():
    """Verifies that 5 consecutive runs of VQC and QNN statevector simulation yield identical analytical results."""
    # Srikakulam sample: SAR VV=-14.2 dB, Temporal Diff=-3.5 dB, Elevation=24m, Rainfall=85mm
    sar_vv = -14.2
    sar_tdiff = -3.5
    elevation = 24.0
    rainfall = 85.0

    for model_name in ["vqc", "qnn"]:
        results = []
        for run_idx in range(5):
            out = quantum_service.predict_quantum_risk(
                sar_vv=sar_vv,
                sar_tdiff=sar_tdiff,
                elevation=elevation,
                rainfall=rainfall,
                model=model_name
            )
            results.append(out)

        base = results[0]
        for i, res in enumerate(results[1:], start=2):
            assert res["risk_score"] == base["risk_score"], f"{model_name} Run {i} risk score drifted: {res['risk_score']} vs {base['risk_score']}"
            assert res["risk_category"] == base["risk_category"], f"{model_name} Run {i} category drifted"
            assert res["qubits"] == base["qubits"]
            assert res["confidence"] == base["confidence"]


def test_evacuation_routing_reproducibility_5_runs():
    """Verifies that Dijkstra and A* graph routing produce identical distances, coordinate paths, and costs across 5 runs."""
    # Srikakulam Municipal Center to Government General Hospital
    origin = Coordinate(latitude=18.2969, longitude=83.8968)
    destination = Coordinate(latitude=18.3150, longitude=83.9100)

    for algorithm in ["dijkstra", "astar"]:
        routes = []
        for run_idx in range(5):
            req = RouteRequest(
                origin=origin,
                destination=destination,
                algorithm=algorithm,
                hazard_avoidance=True
            )
            route_alt = routing_service.calculate_route(req)
            routes.append(route_alt.primary)

        base_route = routes[0]
        for i, r in enumerate(routes[1:], start=2):
            assert r.distance_km == base_route.distance_km, f"{algorithm} Run {i} distance drifted: {r.distance_km} vs {base_route.distance_km}"
            assert r.estimated_time_mins == base_route.estimated_time_mins, f"{algorithm} Run {i} ETA drifted: {r.estimated_time_mins} vs {base_route.estimated_time_mins}"
            assert len(r.geometry.coordinates) == len(base_route.geometry.coordinates), f"{algorithm} Run {i} path length drifted"
            assert r.geometry.coordinates == base_route.geometry.coordinates, f"{algorithm} Run {i} coordinates drifted"
            assert r.route_cost == base_route.route_cost, f"{algorithm} Run {i} route cost drifted"


def test_simulation_scenario_reproducibility_5_runs():
    """Verifies that 5 consecutive runs of hydrological simulation produce 100% identical outputs."""
    sim_outputs = []
    for run_idx in range(5):
        res = simulation_service.run_flood_scenario(
            rainfall_intensity_mm_hr=75.0,
            duration_hours=6.0,
            scenario_name="Heavy Rainfall",
            location="Srikakulam District"
        )
        sim_outputs.append(res)

    base_sim = sim_outputs[0]
    for i, s in enumerate(sim_outputs[1:], start=2):
        assert s["summary"]["simulated_inundation_area_km2"] == base_sim["summary"]["simulated_inundation_area_km2"]
        assert s["summary"]["affected_road_segments"] == base_sim["summary"]["affected_road_segments"]
        assert s["summary"]["risk_level"] == base_sim["summary"]["risk_level"]
        assert s["results_overview"]["recommended_evacuation_route_km"] == base_sim["results_overview"]["recommended_evacuation_route_km"]
        assert s["scenario_comparison"] == base_sim["scenario_comparison"]
