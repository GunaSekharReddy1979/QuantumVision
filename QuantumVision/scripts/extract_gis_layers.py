import os
import sys
import json
import osmium
from shapely.geometry import shape, Point, LineString, MultiLineString, mapping

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BOUNDARY_PATH = os.path.join(ROOT_DIR, "data", "processed", "boundaries", "srikakulam_boundary.geojson")
FACILITIES_SRC = os.path.join(ROOT_DIR, "data", "processed", "facilities", "srikakulam_facilities.geojson")
FACILITIES_PUB = os.path.join(ROOT_DIR, "frontend", "public", "data", "srikakulam_facilities.geojson")

RIVERS_OUT = os.path.join(ROOT_DIR, "data", "processed", "rivers", "srikakulam_rivers.geojson")
RIVERS_PUB = os.path.join(ROOT_DIR, "frontend", "public", "data", "srikakulam_rivers.geojson")

BRIDGES_OUT = os.path.join(ROOT_DIR, "data", "processed", "infrastructure", "srikakulam_bridges.geojson")
BRIDGES_PUB = os.path.join(ROOT_DIR, "frontend", "public", "data", "srikakulam_bridges.geojson")

OSM_PBF_PATH = os.path.join(ROOT_DIR, "reference", "planet_77.464_13.826_892f69a4.osm.pbf")

def ensure_parent(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def main():
    print("=" * 60)
    print("QUANTUMVISION - GIS DATASET EXTRACTION & BOUNDARY CLIPPING")
    print("=" * 60)

    # 1. Load Srikakulam Boundary
    print(f"Loading boundary from: {BOUNDARY_PATH}")
    with open(BOUNDARY_PATH, "r", encoding="utf-8") as f:
        boundary_json = json.load(f)
    boundary_geom = shape(boundary_json["features"][0]["geometry"])
    print(f"Loaded boundary. Valid: {boundary_geom.is_valid}, Area: {boundary_geom.area:.4f} sq deg")

    # 2. Filter & Clip Facilities
    print("\n--- 1. CLIPPING FACILITIES ---")
    with open(FACILITIES_SRC, "r", encoding="utf-8") as f:
        fac_json = json.load(f)

    total_facs = len(fac_json.get("features", []))
    clipped_facs = []
    dropped_facs = []

    for feat in fac_json.get("features", []):
        coords = feat.get("geometry", {}).get("coordinates", [])
        if len(coords) >= 2:
            pt = Point(coords[0], coords[1])
            if boundary_geom.intersects(pt):
                # Ensure district tag is accurate
                feat["properties"]["district"] = "Srikakulam"
                clipped_facs.append(feat)
            else:
                dropped_facs.append(feat["properties"].get("name", "Unknown"))

    print(f"Original facilities: {total_facs}")
    print(f"Inside Srikakulam boundary: {len(clipped_facs)}")
    print(f"Dropped out-of-district facilities: {len(dropped_facs)}")

    clipped_fac_fc = {
        "type": "FeatureCollection",
        "name": "srikakulam_facilities_clipped",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": clipped_facs
    }

    ensure_parent(FACILITIES_SRC)
    ensure_parent(FACILITIES_PUB)
    with open(FACILITIES_SRC, "w", encoding="utf-8") as f:
        json.dump(clipped_fac_fc, f, indent=2, ensure_ascii=False)
    with open(FACILITIES_PUB, "w", encoding="utf-8") as f:
        json.dump(clipped_fac_fc, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(clipped_facs)} verified facilities to {FACILITIES_SRC} and {FACILITIES_PUB}")

    # 3. OSM PBF Waterways & Bridges Extraction
    print("\n--- 2. EXTRACTING OSM WATERWAYS & BRIDGES ---")
    class OsmFeatureHandler(osmium.SimpleHandler):
        def __init__(self, b_geom):
            super().__init__()
            self.b_geom = b_geom
            self.waterways = []
            self.bridges = []

        def way(self, w):
            is_waterway = "waterway" in w.tags
            is_bridge = "bridge" in w.tags and w.tags["bridge"] not in ("no", "none") and ("highway" in w.tags or "railway" in w.tags)

            if not (is_waterway or is_bridge):
                return

            try:
                coords = [(n.lon, n.lat) for n in w.nodes]
                if len(coords) < 2:
                    return
                line = LineString(coords)
                if not line.intersects(self.b_geom):
                    return
                
                clipped = line.intersection(self.b_geom)
                if clipped.is_empty:
                    return

                clipped_lines = []
                if isinstance(clipped, LineString):
                    clipped_lines.append(clipped)
                elif isinstance(clipped, MultiLineString):
                    clipped_lines.extend(clipped.geoms)

                for geom in clipped_lines:
                    if len(geom.coords) < 2:
                        continue
                    g_json = mapping(geom)
                    name = w.tags.get("name", "")
                    
                    if is_waterway:
                        ww_type = w.tags.get("waterway", "river")
                        # Classify category
                        if any(river_name.lower() in name.lower() for river_name in ["vamsadhara", "nagavali", "bahuda", "mahendratanaya", "suvarnamukhi", "vegavati", "gedda"]) or ww_type == "river":
                            category = "river"
                        elif "canal" in ww_type or "canal" in name.lower():
                            category = "canal"
                        elif ww_type in ("stream", "drain", "ditch"):
                            category = "stream"
                        else:
                            category = "waterway"

                        self.waterways.append({
                            "type": "Feature",
                            "properties": {
                                "id": f"ww_{w.id}",
                                "name": name if name else f"Srikakulam Waterway ({ww_type})",
                                "waterway": ww_type,
                                "category": category,
                                "district": "Srikakulam"
                            },
                            "geometry": g_json
                        })

                    if is_bridge:
                        hw = w.tags.get("highway", "")
                        rw = w.tags.get("railway", "")
                        b_type = hw if hw else (f"Railway ({rw})" if rw else "Bridge")
                        self.bridges.append({
                            "type": "Feature",
                            "properties": {
                                "id": f"br_{w.id}",
                                "name": name if name else f"{b_type.capitalize()} Bridge",
                                "bridge": w.tags.get("bridge", "yes"),
                                "highway": hw,
                                "railway": rw,
                                "layer": w.tags.get("layer", "1"),
                                "district": "Srikakulam"
                            },
                            "geometry": g_json
                        })
            except Exception:
                pass

    handler = OsmFeatureHandler(boundary_geom)
    print(f"Parsing OSM PBF file: {OSM_PBF_PATH}...")
    handler.apply_file(OSM_PBF_PATH, locations=True)

    print(f"Extracted {len(handler.waterways)} waterways.")
    print(f"Extracted {len(handler.bridges)} bridges.")

    waterways_fc = {
        "type": "FeatureCollection",
        "name": "srikakulam_waterways",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": handler.waterways
    }

    bridges_fc = {
        "type": "FeatureCollection",
        "name": "srikakulam_bridges",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": handler.bridges
    }

    ensure_parent(RIVERS_OUT)
    ensure_parent(RIVERS_PUB)
    with open(RIVERS_OUT, "w", encoding="utf-8") as f:
        json.dump(waterways_fc, f, indent=2, ensure_ascii=False)
    with open(RIVERS_PUB, "w", encoding="utf-8") as f:
        json.dump(waterways_fc, f, indent=2, ensure_ascii=False)
    print(f"Saved waterways to {RIVERS_OUT} and {RIVERS_PUB}")

    ensure_parent(BRIDGES_OUT)
    ensure_parent(BRIDGES_PUB)
    with open(BRIDGES_OUT, "w", encoding="utf-8") as f:
        json.dump(bridges_fc, f, indent=2, ensure_ascii=False)
    with open(BRIDGES_PUB, "w", encoding="utf-8") as f:
        json.dump(bridges_fc, f, indent=2, ensure_ascii=False)
    print(f"Saved bridges to {BRIDGES_OUT} and {BRIDGES_PUB}")

    print("\nExtraction & Boundary Clipping completed successfully!")

if __name__ == "__main__":
    main()

