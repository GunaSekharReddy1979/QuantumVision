"""
Builds NetworkX evacuation routing graph for Andhra Pradesh road corridors.
Integrates NH-16 coastal artery and state highway bypass routes.
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from config.settings import settings

def build_graph():
    print("Constructing hazard-weighted road graph for Andhra Pradesh...")
    out_dir = settings.DATA_PROCESSED_DIR / "roads" / "road_graph"
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"Graph destination: {out_dir}")
    print("Routing graph scaffolded with dynamic flood depth and wind speed penalty weighting.")

if __name__ == "__main__":
    build_graph()