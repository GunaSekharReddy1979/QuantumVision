"""
QuantumVision GIS Data Preprocessing Pipeline for Srikakulam District.
Extracts:
1. Srikakulam District Boundary from Census 2011 official GeoJSON.
2. OSM Road Network within Srikakulam into GeoJSON and NetworkX GraphML.
3. OSM Emergency Facilities (Hospitals, Clinics, Shelters, Schools) into GeoJSON.
4. Rainfall records aggregation for Coastal AP.
"""
import json
import math
from pathlib import Path
import geopandas as gpd
import networkx as nx
import pandas as pd
import osmium

PROJECT_ROOT = Path(__file__).resolve().parent.parent
REFERENCE_DIR = PROJECT_ROOT / "reference"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

# Srikakulam District bounding box
SRIKAKULAM_BBOX = (83.40, 18.05, 84.80, 19.20) # min_lon, min_lat, max_lon, max_lat

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates distance in meters between two lat/lon coordinates."""
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def step1_extract_boundary():
    print("[1/3] Extracting Srikakulam District Boundary...")
    geojson_path = REFERENCE_DIR / "maps-master" / "maps-master" / "website" / "docs" / "data" / "geojson" / "dists11.geojson"
    if not geojson_path.exists():
        print(f"Error: {geojson_path} not found.")
        return None

    gdf = gpd.read_file(geojson_path)
    srikakulam = gdf[gdf["DISTRICT"].astype(str).str.upper().str.contains("SRIKAKULAM")].copy()
    if srikakulam.empty:
        print("Error: Srikakulam district not found in dists11.geojson")
        return None

    out_file = PROCESSED_DIR / "boundaries" / "srikakulam_boundary.geojson"
    srikakulam.to_file(out_file, driver="GeoJSON")
    print(f"  -> Saved full boundary to {out_file}")

    sri_simple = srikakulam.copy()
    sri_simple["geometry"] = sri_simple["geometry"].simplify(0.005, preserve_topology=True)
    simple_file = PROCESSED_DIR / "boundaries" / "srikakulam_boundary_web.geojson"
    sri_simple.to_file(simple_file, driver="GeoJSON")
    print(f"  -> Saved simplified web boundary to {simple_file}")
    return srikakulam

class OSMDataExtractor(osmium.SimpleHandler):
    def __init__(self, bbox):
        super().__init__()
        self.bbox = bbox
        self.nodes = {}  # node_id -> (lon, lat)
        self.roads = []
        self.facilities = []

        self.valid_highways = {
            "motorway", "trunk", "primary", "secondary", "tertiary",
            "motorway_link", "trunk_link", "primary_link", "secondary_link", "tertiary_link",
            "unclassified", "residential"
        }

    def node(self, n):
        x, y = n.location.lon, n.location.lat
        if self.bbox[0] <= x <= self.bbox[2] and self.bbox[1] <= y <= self.bbox[3]:
            self.nodes[n.id] = (round(x, 6), round(y, 6))

            tags = dict(n.tags)
            amenity = tags.get("amenity")
            emergency = tags.get("emergency")
            if amenity in ["hospital", "clinic", "shelter", "community_centre", "school", "townhall"] or emergency:
                fac_type = "hospital" if amenity in ["hospital", "clinic"] else (
                    "shelter" if (amenity in ["shelter", "community_centre", "townhall"] or emergency) else "school"
                )
                self.facilities.append({
                    "id": f"fac_{n.id}",
                    "name": tags.get("name") or f"Facility {n.id}",
                    "type": fac_type,
                    "subtype": amenity or emergency or "facility",
                    "latitude": y,
                    "longitude": x,
                    "phone": tags.get("phone") or tags.get("contact:phone") or "N/A",
                    "capacity_est": 350 if fac_type == "hospital" else (500 if fac_type == "shelter" else 250)
                })

    def way(self, w):
        hw = w.tags.get("highway")
        if hw in self.valid_highways:
            way_pts = []
            way_node_ids = []
            for n in w.nodes:
                if n.ref in self.nodes:
                    way_pts.append(self.nodes[n.ref])
                    way_node_ids.append(n.ref)

            if len(way_pts) >= 2:
                name = w.tags.get("name", "")
                ref = w.tags.get("ref", "")
                label = f"{ref} {name}".strip() or f"{hw.capitalize()} Road"
                self.roads.append({
                    "id": w.id,
                    "highway": hw,
                    "name": label,
                    "node_ids": way_node_ids,
                    "coordinates": way_pts
                })

def step2_extract_osm():
    print("[2/3] Extracting Srikakulam Roads & Facilities from OSM PBF...")
    pbf_path = REFERENCE_DIR / "planet_77.464_13.826_892f69a4.osm.pbf"
    if not pbf_path.exists():
        print(f"Error: {pbf_path} not found.")
        return

    extractor = OSMDataExtractor(SRIKAKULAM_BBOX)
    extractor.apply_file(str(pbf_path), locations=True, idx="sparse_mem_array")
    print(f"  -> Extracted {len(extractor.roads)} road segments and {len(extractor.facilities)} facilities.")

    fac_features = []
    for fac in extractor.facilities:
        fac_features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [fac["longitude"], fac["latitude"]]
            },
            "properties": {
                "id": fac["id"],
                "name": fac["name"],
                "type": fac["type"],
                "subtype": fac["subtype"],
                "capacity": fac["capacity_est"],
                "contact": fac["phone"],
                "district": "Srikakulam",
                "status": "OPERATIONAL"
            }
        })
    fac_geojson = {
        "type": "FeatureCollection",
        "features": fac_features
    }
    fac_out = PROCESSED_DIR / "facilities" / "srikakulam_facilities.geojson"
    with open(fac_out, "w", encoding="utf-8") as f:
        json.dump(fac_geojson, f, indent=2)
    print(f"  -> Saved facilities to {fac_out}")

    G = nx.Graph()
    road_features = []
    primary_corridors = {"trunk", "primary", "secondary", "tertiary", "trunk_link", "primary_link", "secondary_link", "motorway"}

    for r in extractor.roads:
        pts = r["coordinates"]
        nids = r["node_ids"]
        hw = r["highway"]
        name = r["name"]

        total_dist_m = 0.0
        for i in range(len(pts) - 1):
            p1 = pts[i]
            p2 = pts[i + 1]
            seg_dist = haversine_distance(p1[1], p1[0], p2[1], p2[0])
            total_dist_m += seg_dist

            u, v = nids[i], nids[i + 1]
            G.add_node(u, lon=p1[0], lat=p1[1])
            G.add_node(v, lon=p2[0], lat=p2[1])

            speed = 80 if "trunk" in hw else (60 if "primary" in hw else (50 if "secondary" in hw else 40))
            travel_time_sec = (seg_dist / 1000.0) / speed * 3600.0

            G.add_edge(u, v,
                       weight=round(seg_dist, 2),
                       distance_m=round(seg_dist, 2),
                       time_sec=round(travel_time_sec, 1),
                       highway=hw,
                       name=name,
                       hazard_penalty=1.0)

        if hw in primary_corridors:
            road_features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": pts
                },
                "properties": {
                    "id": r["id"],
                    "name": name,
                    "highway": hw,
                    "length_m": round(total_dist_m, 1)
                }
            })

    roads_geojson = {
        "type": "FeatureCollection",
        "features": road_features
    }
    roads_out = PROCESSED_DIR / "roads" / "srikakulam_roads.geojson"
    with open(roads_out, "w", encoding="utf-8") as f:
        json.dump(roads_geojson, f, indent=2)
    print(f"  -> Saved {len(road_features)} major road corridors to {roads_out}")

    graphml_out = PROCESSED_DIR / "roads" / "srikakulam_road_network.graphml"
    nx.write_graphml(G, str(graphml_out))
    print(f"  -> Saved NetworkX Road Graph ({G.number_of_nodes()} nodes, {G.number_of_edges()} edges) to {graphml_out}")

def step3_process_rainfall():
    print("[3/3] Processing Andhra Pradesh Telemetry Rainfall Data...")
    rf_path = REFERENCE_DIR / "rainfall_tel_hr_andhra_pradesh_sw_ap_2021_2025.csv"
    if not rf_path.exists():
        print(f"Error: {rf_path} not found.")
        return

    df = pd.read_csv(rf_path)
    coastal_df = df[df["District"].astype(str).str.upper().isin(["VIZIANAGARAM", "VISAKHAPATNAM"])].copy()
    print(f"  -> Filtered {len(coastal_df)} telemetry hourly records for North Coastal AP.")

    rf_col = "Telemetry Hourly Rainfall (mm)"
    coastal_df[rf_col] = pd.to_numeric(coastal_df[rf_col], errors="coerce").fillna(0.0)

    stats = {
        "total_records": len(coastal_df),
        "source": "Andhra Pradesh State Water Resources Department (SW_AP)",
        "regional_coverage": "North Coastal Andhra Pradesh (Adjacent Vizianagaram & Visakhapatnam Telemetry)",
        "srikakulam_attribution": "REGIONAL_INTERPOLATED (Adjacent Basin Telemetry)",
        "mean_hourly_rainfall_mm": round(float(coastal_df[rf_col].mean()), 2),
        "max_hourly_rainfall_mm": round(float(coastal_df[rf_col].max()), 2),
        "p95_hourly_rainfall_mm": round(float(coastal_df[rf_col].quantile(0.95)), 2),
        "stations_monitored": coastal_df["Station"].unique().tolist(),
        "date_range": {
            "start": str(coastal_df["Data Acquisition Time"].min()),
            "end": str(coastal_df["Data Acquisition Time"].max())
        }
    }

    out_json = PROCESSED_DIR / "rainfall" / "coastal_rainfall_stats.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"  -> Saved rainfall statistics to {out_json}")

if __name__ == "__main__":
    step1_extract_boundary()
    step2_extract_osm()
    step3_process_rainfall()
    print("GIS Preprocessing Complete!")