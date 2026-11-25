"""
Validate raw datasets, checking file paths, formats, and EPSG:4326 CRS compatibility.
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from config.settings import settings
from services.dataset_service import dataset_service

def validate_all_datasets():
    print("=" * 60)
    print(" QUANTUMVISION DATASET VALIDATION AUDIT")
    print("=" * 60)
    datasets = dataset_service.list_datasets()
    for ds in datasets:
        res = dataset_service.validate_dataset(ds.file_path)
        print(f"[{'PASS' if res.valid else 'WARN'}] {ds.name} ({ds.category}) - Format: {ds.format.upper()} | CRS: {res.crs or 'N/A'}")
        if res.warnings:
            for w in res.warnings:
                print(f"       Note: {w}")
    print("=" * 60)
    print(f"Audit complete: {len(datasets)} datasets registered.")

if __name__ == "__main__":
    validate_all_datasets()