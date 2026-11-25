"""
QuantumVision Flood Inference CLI & Helper Interface.
Executes flood prediction across Classical & Quantum models.
"""
import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.inference.prediction_pipeline import predict_flood_risk

def run_inference_demo():
    print("======================================================================")
    print(" QUANTUMVISION MULTI-MODEL INFERENCE DEMO")
    print(" Location: Srikakulam District (Lat: 18.2969, Lon: 83.8968)")
    print("======================================================================")

    # Moderate flood risk scenario sample
    test_features = {
        "sar_vv_db": -11.5,
        "sar_vh_db": -17.2,
        "sar_vv_vh_ratio": 5.7,
        "sar_temporal_diff_db": -1.8,
        "elevation_m": 12.0,
        "slope_deg": 1.5,
        "distance_to_waterway_km": 1.2,
        "rainfall_accum_24h_mm": 95.0,
        "rainfall_intensity_mm_hr": 12.0
    }

    models = ["random_forest", "xgboost", "vqc_quantum", "qnn_quantum", "ensemble"]

    print("Input Features:")
    for k, v in test_features.items():
        print(f"  - {k:<25}: {v}")
    print("-" * 70)

    for m in models:
        result = predict_flood_risk(features=test_features, model_name=m)
        print(f"[{result['model_used']}]")
        print(f"  Risk Category : {result['risk_category']} (Score: {result['risk_score']:.3f}, Confidence: {result['confidence']:.2f})")
        print(f"  Data Status   : {result['data_status']}")
        print(f"  Action        : {result['recommendation']}")
        print("-" * 70)

if __name__ == "__main__":
    run_inference_demo()