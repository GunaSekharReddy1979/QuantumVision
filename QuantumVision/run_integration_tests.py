"""
Standalone Integration Test Suite for QuantumVision Backend & GIS.
Verifies API contracts, GeoJSON payloads, Hazard assessment, and Graph Routing.
"""
import sys
import os
import time

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from tests.integration.test_frontend_backend import (
    test_frontend_health_contract,
    test_frontend_districts_contract,
)
from tests.integration.test_map_api import (
    test_map_hazards_geojson_contract,
    test_map_routing_geojson_contract,
)

def run_all_tests():
    print("=" * 70)
    print("QUANTUMVISION END-TO-END INTEGRATION TEST SUITE")
    print("=" * 70)
    
    tests_to_run = [
        ("Health Contract (/api/health)", test_frontend_health_contract),
        ("Districts Contract (/api/locations/districts)", test_frontend_districts_contract),
        ("Hazard Assessment Contract (/api/hazards/flood/analyze)", test_map_hazards_geojson_contract),
        ("Graph Routing A* Contract (/api/routing/route)", test_map_routing_geojson_contract),
    ]
    
    passed = 0
    total = len(tests_to_run)
    
    for name, test_fn in tests_to_run:
        t0 = time.time()
        print(f"\n[RUNNING] {name} ...")
        try:
            test_fn()
            duration = time.time() - t0
            print(f"[PASSED]  {name} ({duration:.2f}s)")
            passed += 1
        except Exception as e:
            duration = time.time() - t0
            print(f"[FAILED]  {name} ({duration:.2f}s) - Error: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 70)
    print(f"RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("=" * 70)
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
