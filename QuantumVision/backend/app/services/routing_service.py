"""
Dynamic Flood-Aware Evacuation Routing Engine for Srikakulam District.
Supports:
- Strict Area of Interest (AOI) boundary enforcement (Srikakulam District)
- A* Algorithm with Haversine heuristic
- Dijkstra Shortest Path Algorithm
- Dynamic Flood-Inundation Edge Avoidance and Penalty Weighting
- Genuine alternative path generation on surveyed road network (zero synthetic coordinate shifts)
- Turn-by-turn geometry generation for Leaflet Digital Twin map
"""
import math
import uuid
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional, Set
import networkx as nx
import numpy as np
import joblib
from scipy.spatial import KDTree

try:
    from shapely.geometry import shape, Point, LineString
    from shapely.ops import unary_union
    from shapely.prepared import prep
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False

from app.core.logger import logger
from app.schemas.route import RouteRequest, RouteResponse, RouteAlternativeResponse, RouteGeometry
from app.schemas.location import Coordinate

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
GRAPH_PATH = PROJECT_ROOT / "data" / "processed" / "roads" / "srikakulam_arterial_graph.joblib"
FLOOD_GEOJSON_PATH = PROJECT_ROOT / "data" / "processed" / "flood" / "srikakulam_flood_inundation.geojson"
BOUNDARY_GEOJSON_PATH = PROJECT_ROOT / "data" / "processed" / "boundaries" / "srikakulam_boundary.geojson"

MAX_SNAPPING_DISTANCE_KM = 3.0  # Strict maximum snapping threshold (3.0 km)
ROAD_SPEED_KMH = {
    "motorway": 65.0,
    "trunk": 55.0,
    "primary": 45.0,
    "secondary": 35.0,
    "tertiary": 30.0,
    "unclassified": 25.0,
    "residential": 25.0,
    "service": 15.0,
    "living_street": 10.0,
}

class RoutingService:
    def __init__(self):
        self.graph: Optional[nx.Graph] = None
        self.node_list: List[Tuple[float, float]] = []
        self.kdtree: Optional[KDTree] = None
        self.boundary_geom = None
        self.prep_boundary = None
        self.flood_features: List[Dict[str, Any]] = []
        self.flood_union = None
        self.prep_flood_union = None
        self.flood_bounds: Optional[Tuple[float, float, float, float]] = None
        self.flood_polygons_count: int = 0
        self._flood_edge_cache: Dict[Tuple[Tuple[float, float], Tuple[float, float]], bool] = {}
        self._load_boundary()
        self._load_network()
        self._load_flood_zones()

    def _load_boundary(self):
        """Loads authoritative Srikakulam district boundary for strict AOI verification."""
        try:
            if BOUNDARY_GEOJSON_PATH.exists() and SHAPELY_AVAILABLE:
                with open(BOUNDARY_GEOJSON_PATH, "r", encoding="utf-8") as f:
                    b_data = json.load(f)
                features = b_data.get("features", [])
                if features:
                    self.boundary_geom = shape(features[0]["geometry"])
                    self.prep_boundary = prep(self.boundary_geom)
                    logger.info("Loaded and prepared authoritative Srikakulam boundary polygon for routing AOI.")
            else:
                logger.warning(f"Boundary GeoJSON not found at {BOUNDARY_GEOJSON_PATH}")
        except Exception as e:
            logger.error(f"Error loading Srikakulam boundary in RoutingService: {e}")

    def _validate_aoi(self, lat: float, lon: float, label: str = "coordinate"):
        """Validates that a coordinate is strictly inside Srikakulam District AOI."""
        if self.prep_boundary is not None and SHAPELY_AVAILABLE:
            pt = Point(lon, lat)
            if not self.prep_boundary.intersects(pt):
                raise ValueError(
                    f"Requested {label} ({lat:.4f}°N, {lon:.4f}°E) is outside Srikakulam District Area of Interest (AOI). "
                    "Evacuation routing is strictly confined to Srikakulam District."
                )

    def _load_network(self):
        try:
            if GRAPH_PATH.exists():
                logger.info(f"Loading Srikakulam road network graph from {GRAPH_PATH}...")
                full_graph = joblib.load(GRAPH_PATH)
                self.total_nodes_count = full_graph.number_of_nodes()
                self.total_edges_count = full_graph.number_of_edges()
                if nx.is_connected(full_graph):
                    self.graph = full_graph
                else:
                    largest_cc = max(nx.connected_components(full_graph), key=len)
                    self.graph = full_graph.subgraph(largest_cc).copy()
                self.node_list = sorted(list(self.graph.nodes()), key=lambda n: (round(n[1], 7), round(n[0], 7)))
                coords = np.array([[n[1], n[0]] for n in self.node_list])  # [lat, lon]
                self.kdtree = KDTree(coords)
                logger.info(f"Road graph loaded: {self.total_nodes_count} nodes, {self.total_edges_count} edges ({self.graph.number_of_nodes()} connected corridor nodes).")
            else:
                logger.error(f"Surveyed road graph not found at {GRAPH_PATH}; routing is unavailable.")
                self.graph = None
        except Exception as e:
            logger.error(f"Error loading surveyed road graph: {e}. Routing is unavailable.")
            self.graph = None
            self.node_list = []
            self.kdtree = None

    def _load_flood_zones(self):
        try:
            if FLOOD_GEOJSON_PATH.exists():
                with open(FLOOD_GEOJSON_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.flood_features = data.get("features", [])
                    self.flood_polygons_count = len(self.flood_features)

                    if SHAPELY_AVAILABLE:
                        geoms = [shape(feat["geometry"]) for feat in self.flood_features if feat.get("geometry")]
                        if geoms:
                            self.flood_union = unary_union(geoms)
                            self.flood_bounds = self.flood_union.bounds
                            self.prep_flood_union = prep(self.flood_union)
                            logger.info(f"Prepared unified Shapely spatial index for {len(geoms)} flood inundation polygons.")

                            # Pre-tag road network edges intersecting flood zones for sub-50ms O(1) routing
                            if self.graph is not None and self.flood_bounds is not None:
                                minx, miny, maxx, maxy = self.flood_bounds
                                flood_edge_count = 0
                                for u, v, d in self.graph.edges(data=True):
                                    if (max(u[0], v[0]) >= minx and min(u[0], v[0]) <= maxx and
                                        max(u[1], v[1]) >= miny and min(u[1], v[1]) <= maxy):
                                        is_fl = bool(self.prep_flood_union.intersects(LineString([u, v])))
                                        d["is_flooded"] = is_fl
                                        if is_fl:
                                            flood_edge_count += 1
                                    else:
                                        d["is_flooded"] = False
                                logger.info(f"Pre-tagged {flood_edge_count} flood-intersecting road edges for instant O(1) evaluation.")
                    else:
                        self.flood_bounds = None
        except Exception as e:
            self.flood_bounds = None
            logger.warning(f"Could not load flood polygons: {e}")

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
        return R * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    def _is_point_in_flood(self, lon: float, lat: float) -> bool:
        """Exact spatial point-in-polygon test with bounding box fast-rejection."""
        bounds = self.flood_bounds
        if bounds is not None:
            minx, miny, maxx, maxy = bounds
            if lon < minx or lon > maxx or lat < miny or lat > maxy:
                return False
        if self.prep_flood_union is not None and SHAPELY_AVAILABLE:
            return bool(self.prep_flood_union.contains(Point(lon, lat)))
        return False

    def _edge_intersects_flood(self, node1: Tuple[float, float], node2: Tuple[float, float]) -> bool:
        """Checks the complete road segment, avoiding missed narrow flood crossings."""
        if self.graph is not None:
            ed = self.graph.get_edge_data(node1, node2)
            if ed and "is_flooded" in ed:
                return bool(ed["is_flooded"])

        if self.prep_flood_union is None or not SHAPELY_AVAILABLE:
            return False
        edge_key = (min(node1, node2), max(node1, node2))
        if hasattr(self, "_flood_edge_cache") and edge_key in self._flood_edge_cache:
            return self._flood_edge_cache[edge_key]

        bounds = self.flood_bounds
        if bounds is not None:
            minx, miny, maxx, maxy = bounds
            if (
                max(node1[0], node2[0]) < minx
                or min(node1[0], node2[0]) > maxx
                or max(node1[1], node2[1]) < miny
                or min(node1[1], node2[1]) > maxy
            ):
                if hasattr(self, "_flood_edge_cache"):
                    self._flood_edge_cache[edge_key] = False
                return False
        res = bool(self.prep_flood_union.intersects(LineString([node1, node2])))
        if hasattr(self, "_flood_edge_cache"):
            self._flood_edge_cache[edge_key] = res
        return res

    @staticmethod
    def _edge_speed_kmh(edge_data: Dict[str, Any]) -> float:
        """Uses conservative road-class speeds for a modelled ETA, not live traffic."""
        highway = edge_data.get("highway", "unclassified")
        highway_types = highway if isinstance(highway, (list, tuple)) else [highway]
        speeds = [ROAD_SPEED_KMH.get(str(kind), 25.0) for kind in highway_types]
        return min(speeds, default=25.0)

    def _find_nearest_node(self, lat: float, lon: float, validate_distance: bool = True) -> Tuple[float, float]:
        """Snaps coordinate to nearest graph node and validates strict maximum snapping threshold."""
        if self.kdtree is None or not self.node_list:
            raise ValueError("Surveyed road network is unavailable; no route can be calculated.")
        _, idx = self.kdtree.query([lat, lon])
        nearest_node = self.node_list[idx]

        if validate_distance:
            snap_dist_km = self._haversine(lat, lon, nearest_node[1], nearest_node[0])
            if snap_dist_km > MAX_SNAPPING_DISTANCE_KM:
                raise ValueError(
                    f"Requested coordinate ({lat:.4f}°N, {lon:.4f}°E) is {snap_dist_km:.1f} km away from surveyed road network, "
                    f"exceeding the maximum allowed snapping radius ({MAX_SNAPPING_DISTANCE_KM} km)."
                )
        return nearest_node

    def calculate_route(self, req: RouteRequest) -> RouteAlternativeResponse:
        """
        Calculates primary and alternative evacuation routes using A* or Dijkstra.
        Strictly enforces Srikakulam District boundary and 3 km snapping radius.
        Avoids flooded corridors and generates genuine alternative routes via edge penalties.
        """
        # 1. Validate required coordinates and enforce strict AOI containment
        if not req or not getattr(req, "origin", None) or not getattr(req, "destination", None):
            raise ValueError("Origin and destination coordinates are required for route calculation.")

        self._validate_aoi(req.origin.latitude, req.origin.longitude, label="origin")
        self._validate_aoi(req.destination.latitude, req.destination.longitude, label="destination")

        # 2. Snap to nearest verified road network nodes (within 3 km)
        orig_node = self._find_nearest_node(req.origin.latitude, req.origin.longitude)
        dest_node = self._find_nearest_node(req.destination.latitude, req.destination.longitude)

        algorithm = req.algorithm.lower() if hasattr(req, "algorithm") and req.algorithm else "astar"
        avoid_flood = req.hazard_avoidance if hasattr(req, "hazard_avoidance") else True

        # Dynamic penalty scaling based on rainfall forecast or severity
        rainfall = getattr(req, "rainfall_mm", 0.0) or 0.0
        if rainfall >= 100.0 or getattr(req, "flood_severity", "") == "SEVERE":
            penalty_primary = 500.0
        elif rainfall >= 50.0 or getattr(req, "flood_severity", "") == "HIGH":
            penalty_primary = 200.0
        else:
            penalty_primary = 100.0

        # Compute Primary Route
        primary_route, primary_edges = self._compute_single_path(
            orig_node, dest_node, algorithm=algorithm, avoid_flood=avoid_flood, penalty_factor=penalty_primary, is_alternative=False
        )

        alternatives = []
        if req.max_alternatives > 0 and primary_edges:
            # Authentic alternative routing: penalize edges of primary path to find genuine alternate corridor
            try:
                alt_route, _ = self._compute_single_path(
                    orig_node, dest_node, algorithm="astar",
                    avoid_flood=avoid_flood, penalty_factor=penalty_primary,
                    is_alternative=True, penalized_edges=primary_edges
                )
                alternatives.append(alt_route)
            except Exception as e:
                logger.warning(f"Could not compute distinct alternative route: {e}")

        return RouteAlternativeResponse(
            primary=primary_route,
            alternatives=alternatives
        )

    def _compute_single_path(
        self,
        u: Tuple[float, float],
        v: Tuple[float, float],
        algorithm: str = "astar",
        avoid_flood: bool = True,
        penalty_factor: float = 100.0,
        is_alternative: bool = False,
        penalized_edges: Optional[Set[Tuple[Tuple[float, float], Tuple[float, float]]]] = None
    ) -> Tuple[RouteResponse, Set[Tuple[Tuple[float, float], Tuple[float, float]]]]:
        route_id = str(uuid.uuid4())

        def dynamic_weight(node1, node2, edge_data):
            base_dist = edge_data.get("distance_km", edge_data.get("weight", 0.1))
            mult = 1.0

            # If this edge was part of the primary path, penalize it to force a genuine alternative corridor
            if penalized_edges and ((node1, node2) in penalized_edges or (node2, node1) in penalized_edges):
                mult *= 4.0

            if avoid_flood:
                is_fl = edge_data.get("is_flooded") if "is_flooded" in edge_data else self._edge_intersects_flood(node1, node2)
                if is_fl:
                    mult *= penalty_factor

            return base_dist * mult

        def heuristic(node1, node2):
            return self._haversine(node1[1], node1[0], node2[1], node2[0])

        if not self.graph or not nx.has_path(self.graph, u, v):
            raise ValueError("No route is available on the surveyed road network for these locations.")

        try:
            if algorithm == "astar":
                path = nx.astar_path(self.graph, u, v, heuristic=heuristic, weight=dynamic_weight)
            else:
                path = nx.dijkstra_path(self.graph, u, v, weight=dynamic_weight)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            raise ValueError("No route is available on the surveyed road network for these locations.")

        coords = []
        total_dist_km = 0.0
        total_time_mins = 0.0
        flood_affected_edges = 0
        used_edges: Set[Tuple[Tuple[float, float], Tuple[float, float]]] = set()
        route_steps: List[Dict[str, Any]] = []

        for i in range(len(path)):
            pt = path[i]
            coords.append([pt[0], pt[1]])  # [lon, lat]
            if i > 0:
                p_prev = path[i-1]
                used_edges.add((p_prev, pt))
                edge_data = self.graph.get_edge_data(p_prev, pt) or {}
                step_dist = edge_data.get("distance_km", edge_data.get("weight"))
                if step_dist is None or not math.isfinite(float(step_dist)) or float(step_dist) < 0:
                    step_dist = self._haversine(p_prev[1], p_prev[0], pt[1], pt[0])
                step_dist = float(step_dist)
                total_dist_km += step_dist
                total_time_mins += (step_dist / self._edge_speed_kmh(edge_data)) * 60.0
                intersects_flood = self._edge_intersects_flood(p_prev, pt)
                if intersects_flood:
                    flood_affected_edges += 1

                road_name = edge_data.get("name") or edge_data.get("highway") or "Unnamed surveyed road"
                if isinstance(road_name, (list, tuple)):
                    road_name = " / ".join(str(name) for name in road_name)
                if route_steps and route_steps[-1]["road_name"] == str(road_name):
                    route_steps[-1]["distance_km"] = round(route_steps[-1]["distance_km"] + step_dist, 2)
                    route_steps[-1]["flood_affected_edges"] += int(intersects_flood)
                else:
                    route_steps.append({
                        "road_name": str(road_name),
                        "distance_km": round(step_dist, 2),
                        "flood_affected_edges": int(intersects_flood),
                    })

        total_dist_km = round(total_dist_km, 2)
        est_time_mins = round(total_time_mins, 1)

        flood_data_available = self.prep_flood_union is not None and self.flood_polygons_count > 0
        hazard_exposure = (
            "Unknown (Mapped Flood-Zone Data Unavailable)"
            if not flood_data_available
            else "Moderate (Mapped Flood-Zone Exposure)"
            if flood_affected_edges
            else "Low (No Mapped Flood-Zone Crossings)"
        )
        if algorithm == "astar":
            algorithm_label = "A* Flood-Penalized Surveyed-Road Path" if avoid_flood else "A* Surveyed-Road Path"
        else:
            algorithm_label = "Dijkstra Flood-Penalized Surveyed-Road Path" if avoid_flood else "Dijkstra Surveyed-Road Path"

        warnings_list = []
        if not flood_data_available:
            warnings_list.append("Mapped flood-zone data unavailable; route was not checked for flood exposure.")
        elif flood_affected_edges > 0:
            warnings_list.append(
                f"Route intersects {flood_affected_edges} road segments in mapped flood zones."
            )
        elif avoid_flood:
            warnings_list.append("No mapped flood-zone road segments intersect this route.")
        else:
            warnings_list.append("Flood avoidance is disabled for this route.")
        warnings_list.append("Safety Note: Route follows mapped road-network data and is not a safety guarantee.")

        route_res = RouteResponse(
            route_id=route_id,
            geometry=RouteGeometry(coordinates=coords),
            distance_km=total_dist_km,
            estimated_time_mins=est_time_mins,
            hazard_exposure=hazard_exposure,
            route_cost=round(total_dist_km * (1.12 if is_alternative else 1.0), 2),
            route_type="Alternative Evacuation Route" if is_alternative else "Primary Evacuation Corridor",
            warnings=warnings_list,
            explanation={
                "route_method": algorithm_label,
                "distance_km": total_dist_km,
                "estimated_time_mins": est_time_mins,
                "avoidance_constraints": "Sentinel-1 SAR & DEM Inundation Zones",
                "flood_affected_edges": flood_affected_edges,
                "route_steps": route_steps,
                "algorithm": algorithm.upper(),
                "destination_safety": "Not assessed by the routing service."
            }
        )
        return route_res, used_edges

    def get_status(self) -> Dict[str, Any]:
        return {
            "graph_loaded": self.graph is not None,
            "nodes_count": getattr(self, "total_nodes_count", self.graph.number_of_nodes() if self.graph else 0),
            "connected_corridor_nodes": self.graph.number_of_nodes() if self.graph else 0,
            "edges_count": getattr(self, "total_edges_count", self.graph.number_of_edges() if self.graph else 0),
            "flood_polygons_loaded": self.flood_polygons_count,
            "boundary_enforcement": "STRICT_SRIKAKULAM_AOI",
            "max_snapping_radius_km": MAX_SNAPPING_DISTANCE_KM,
            "algorithms_supported": ["A*", "Dijkstra"],
            "region": "Srikakulam District, Andhra Pradesh"
        }

routing_service = RoutingService()
