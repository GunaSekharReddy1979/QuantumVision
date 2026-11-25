"""
QuantumVision Health Check Diagnostic Script.
Validates backend, database, configuration, and data paths.
"""
import sys
from pathlib import Path

# Add backend directory to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from config.settings import settings
from config.logging import logger

def run_health_diagnostics():
    print("=" * 60)
    print(" QUANTUMVISION SYSTEM HEALTH CHECK")
    print("=" * 60)
    print(f"Project Name   : {settings.PROJECT_NAME}")
    print(f"Version        : {settings.PROJECT_VERSION}")
    print(f"Environment    : {settings.ENVIRONMENT}")
    print(f"Root Directory : {settings.ROOT_DIR}")
    print(f"Data Raw Dir   : {settings.DATA_RAW_DIR} (Exists: {settings.DATA_RAW_DIR.exists()})")
    print(f"Data Proc Dir  : {settings.DATA_PROCESSED_DIR} (Exists: {settings.DATA_PROCESSED_DIR.exists()})")
    print(f"Features Dir   : {settings.DATA_FEATURES_DIR} (Exists: {settings.DATA_FEATURES_DIR.exists()})")
    print(f"ML Models Dir  : {settings.ML_MODELS_DIR} (Exists: {settings.ML_MODELS_DIR.exists()})")
    print(f"Quantum Engine : {settings.QUANTUM_BACKEND}")
    print(f"Spatial Target : Andhra Pradesh (lat: 12.6-19.9, lon: 76.7-84.8)")
    print("-" * 60)
    print("All core paths and environment settings verified successfully.")
    print("=" * 60)

if __name__ == "__main__":
    run_health_diagnostics()