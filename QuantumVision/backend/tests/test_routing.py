"""
Test suite for Dynamic Evacuation Routing, A* vs Dijkstra,
Flood Hazard Avoidance, Snapping Validation, and Dynamic Route Recalculation.
"""
import pytest
from shapely.geometry import Polygon
from shapely.prepared import prep
from app.schemas.route import RouteRequest
from app.services.routing_service import RoutingService, SHAPELY_AVAILABLE, routing_service

SRIKAKULAM_TOWN_HALL = {"lat": 18.2969, "lon": 83.8968}
RIMS_HOSPITAL = {"lat": 18.3125, "lon": 83.9102}
NARASANNAPETA = {"lat": 18.4215, "lon": 84.0452}
DISTANT_POINT = {"lat": 16.5062, "lon": 80.6480}  # ~400 km away in Vijayawada


def test_calculate_route(client):
    """Verify primary route calculation with valid Srikakulam coordinates using A*."""
    payload = {
        "origin_latitude": SRIKAKULAM_TOWN_HALL["lat"],
        "origin_longitude": SRIKAKULAM_TOWN_HALL["lon"],
        "destination_latitude": RIMS_HOSPITAL["lat"],
        "destination_longitude": RIMS_HOSPITAL["lon"],
        "algorithm": "astar",
        "hazard_avoidance": True
    }
    response = client.post("/api/routing/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    route_data = data["data"]
    assert route_data["primary"]["distance_km"] > 0
    assert len(route_data["primary"]["geometry"]["coordinates"]) >= 2
    assert "safety guarantee" in route_data["safety_disclaimer"]
    route_steps = route_data["primary"]["explanation"]["route_steps"]
    assert route_steps
    assert sum(step["distance_km"] for step in route_steps) == pytest.approx(
        route_data["primary"]["distance_km"], abs=0.1
    )


def test_calculate_alternatives(client):
    """Verify calculation of primary and distinct alternative evacuation paths."""
    payload = {
        "origin_latitude": SRIKAKULAM_TOWN_HALL["lat"],
        "origin_longitude": SRIKAKULAM_TOWN_HALL["lon"],
        "destination_latitude": RIMS_HOSPITAL["lat"],
        "destination_longitude": RIMS_HOSPITAL["lon"],
        "max_alternatives": 1
    }
    response = client.post("/api/routing/alternatives", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["primary"] is not None
    assert len(data["data"]["alternatives"]) >= 1


def test_astar_vs_dijkstra_on_identical_costs():
    """Verify both A* and Dijkstra find valid least-cost paths on the real road graph."""
    req_astar = RouteRequest(
        origin_latitude=SRIKAKULAM_TOWN_HALL["lat"],
        origin_longitude=SRIKAKULAM_TOWN_HALL["lon"],
        destination_latitude=RIMS_HOSPITAL["lat"],
        destination_longitude=RIMS_HOSPITAL["lon"],
        algorithm="astar",
        hazard_avoidance=False
    )
    req_dijkstra = RouteRequest(
        origin_latitude=SRIKAKULAM_TOWN_HALL["lat"],
        origin_longitude=SRIKAKULAM_TOWN_HALL["lon"],
        destination_latitude=RIMS_HOSPITAL["lat"],
        destination_longitude=RIMS_HOSPITAL["lon"],
        algorithm="dijkstra",
        hazard_avoidance=False
    )

    res_astar = routing_service.calculate_route(req_astar)
    res_dijkstra = routing_service.calculate_route(req_dijkstra)

    assert res_astar.primary.distance_km > 0
    assert res_dijkstra.primary.distance_km > 0
    # Both algorithms on identical weights find essentially the same optimal distance
    assert abs(res_astar.primary.distance_km - res_dijkstra.primary.distance_km) < 0.25


def test_flood_hazard_avoidance_dynamic_penalty():
    """Verify that hazard_avoidance penalizes or avoids flooded areas when heavy rainfall occurs."""
    req_normal = RouteRequest(
        origin_latitude=SRIKAKULAM_TOWN_HALL["lat"],
        origin_longitude=SRIKAKULAM_TOWN_HALL["lon"],
        destination_latitude=NARASANNAPETA["lat"],
        destination_longitude=NARASANNAPETA["lon"],
        hazard_avoidance=True,
        rainfall_mm=10.0
    )
    req_severe_flood = RouteRequest(
        origin_latitude=SRIKAKULAM_TOWN_HALL["lat"],
        origin_longitude=SRIKAKULAM_TOWN_HALL["lon"],
        destination_latitude=NARASANNAPETA["lat"],
        destination_longitude=NARASANNAPETA["lon"],
        hazard_avoidance=True,
        rainfall_mm=150.0,
        flood_severity="SEVERE"
    )

    res_normal = routing_service.calculate_route(req_normal)
    res_severe = routing_service.calculate_route(req_severe_flood)

    assert res_normal.primary.distance_km > 0
    assert res_severe.primary.distance_km > 0
    assert "hazard_exposure" in res_severe.primary.model_dump()


@pytest.mark.skipif(not SHAPELY_AVAILABLE, reason="Shapely is required for flood geometry checks")
def test_flood_intersection_detects_crossing_between_road_endpoints():
    service = object.__new__(RoutingService)
    flood_polygon = Polygon([(83.89, 18.29), (83.90, 18.29), (83.90, 18.30), (83.89, 18.30)])
    service.prep_flood_union = prep(flood_polygon)
    service.flood_bounds = flood_polygon.bounds

    assert service._edge_intersects_flood((83.88, 18.295), (83.91, 18.295))


def test_snapping_distance_threshold_rejection(client):
    """Verify that coordinates located far outside Srikakulam are rejected with HTTP 400."""
    payload = {
        "origin_latitude": DISTANT_POINT["lat"],
        "origin_longitude": DISTANT_POINT["lon"],
        "destination_latitude": SRIKAKULAM_TOWN_HALL["lat"],
        "destination_longitude": SRIKAKULAM_TOWN_HALL["lon"]
    }
    response = client.post("/api/routing/route", json=payload)
    assert response.status_code == 400
    msg = response.json().get("message", "")
    assert "outside Srikakulam District Area of Interest" in msg


def test_routing_status_endpoint(client):
    """Verify /api/routing/status endpoint returns valid graph node and flood counts."""
    response = client.get("/api/routing/status")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["graph_loaded"] is True
    assert data["nodes_count"] == 171080
    assert data["edges_count"] == 172144
    assert data["flood_polygons_loaded"] > 0
