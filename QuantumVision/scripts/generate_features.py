"""
Feature engineering pipeline for Andhra Pradesh flood and cyclone risk models.
Exports standardized feature columns to data/features/
"""
import sys
from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from config.settings import settings

FEATURE_METADATA = {
    "flood_features": [
        "precipitation_3hr_mm",
        "precipitation_24hr_sum_mm",
        "elevation_relative_m",
        "slope_degrees",
        "distance_to_river_km",
        "drainage_density_index"
    ],
    "cyclone_features": [
        "sustained_wind_speed_kmh",
        "gust_wind_speed_kmh",
        "central_pressure_deficit_hpa",
        "distance_to_coast_km",
        "storm_surge_hazard_depth_m"
    ],
    "description": "Standard feature schema for Andhra Pradesh hazard models",
    "region": "Andhra Pradesh",
    "updated_at": "2026-09-20T18:00:00Z"
}

def generate_features():
    features_dir = settings.DATA_FEATURES_DIR
    features_dir.mkdir(parents=True, exist_ok=True)
    meta_path = features_dir / "feature_metadata.json"
    with open(meta_path, "w") as f:
        json.dump(FEATURE_METADATA, f, indent=2)
    print(f"Feature metadata written to {meta_path}")

if __name__ == "__main__":
    generate_features()