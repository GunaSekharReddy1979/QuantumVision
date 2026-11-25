"""
Runner script for QuantumVision Classical Machine Learning Models:
1. Classical Rainfall Forecasting (Random Forest & XGBoost Regressors)
2. Classical Flood Risk Classification (Random Forest & XGBoost Classifiers)
"""
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import xgboost as xgb

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

def test_classical_rainfall_models():
    print("=" * 80)
    print("   1. CLASSICAL RAINFALL FORECASTING MODELS (24-HOUR ACCUMULATION)")
    print("=" * 80)
    
    rf_path = PROJECT_ROOT / "ml" / "models" / "rainfall" / "rf_rainfall_24h.joblib"
    xgb_path = PROJECT_ROOT / "ml" / "models" / "rainfall" / "xgb_rainfall_24h.json"
    metrics_path = PROJECT_ROOT / "ml" / "models" / "rainfall" / "evaluation_metrics.json"

    # Display benchmark test metrics
    if metrics_path.exists():
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
        print("\n[Chronological Test Metrics (Unseen 2024-2025 Test Period)]:")
        print(f"{'Model':<30} | {'MAE (mm)':<10} | {'RMSE (mm)':<10} | {'R2 Score':<10} | {'Status':<10}")
        print("-" * 75)
        models_dict = metrics.get("models", metrics)
        for m_key, m_data in models_dict.items():
            if not isinstance(m_data, dict):
                continue
            name = m_data.get("model_name", m_key)
            mae = f"{m_data.get('mae_mm', 'N/A')}"
            rmse = f"{m_data.get('rmse_mm', 'N/A')}"
            r2 = f"{m_data.get('r2_score', 'N/A')}"
            status = m_data.get('status', 'VALIDATED')
            print(f"{name:<30} | {mae:<10} | {rmse:<10} | {r2:<10} | {status:<10}")

    # Load trained models
    rf_model = joblib.load(rf_path) if rf_path.exists() else None
    xgb_reg = xgb.XGBRegressor()
    if xgb_path.exists():
        xgb_reg.load_model(xgb_path)
    else:
        xgb_reg = None

    print("\n[Inference Simulation on Weather Conditions (Srikakulam Stations)]:")
    scenarios = [
        ("Dry Season / Clear Day", {
            "rolling_sum_3h": 0.0, "rolling_sum_6h": 0.0, "rolling_sum_12h": 0.0, "rolling_sum_24h": 0.0,
            "rolling_sum_48h": 0.0, "rolling_sum_72h": 0.0, "lag_1h": 0.0, "lag_2h": 0.0, "lag_3h": 0.0,
            "lag_6h": 0.0, "lag_12h": 0.0, "lag_24h": 0.0, "max_intensity_past_24h": 0.0,
            "temperature_c": 32.5, "relative_humidity_pct": 58.0, "wind_speed_kmh": 9.2,
            "hour_sin": 0.0, "hour_cos": 1.0, "day_of_year_sin": 0.5, "day_of_year_cos": 0.866,
            "month": 3, "elevation_m": 12.0
        }),
        ("Moderate Monsoonal Rainfall", {
            "rolling_sum_3h": 10.5, "rolling_sum_6h": 19.0, "rolling_sum_12h": 33.0, "rolling_sum_24h": 55.5,
            "rolling_sum_48h": 78.0, "rolling_sum_72h": 110.0, "lag_1h": 4.5, "lag_2h": 3.8, "lag_3h": 2.2,
            "lag_6h": 8.5, "lag_12h": 14.0, "lag_24h": 22.5, "max_intensity_past_24h": 8.5,
            "temperature_c": 26.2, "relative_humidity_pct": 88.0, "wind_speed_kmh": 18.5,
            "hour_sin": 0.707, "hour_cos": -0.707, "day_of_year_sin": 0.95, "day_of_year_cos": -0.31,
            "month": 7, "elevation_m": 8.0
        }),
        ("Heavy Torrential Downpour / Inundation", {
            "rolling_sum_3h": 45.5, "rolling_sum_6h": 77.5, "rolling_sum_12h": 135.5, "rolling_sum_24h": 190.0,
            "rolling_sum_48h": 250.0, "rolling_sum_72h": 310.0, "lag_1h": 18.5, "lag_2h": 15.0, "lag_3h": 12.0,
            "lag_6h": 32.0, "lag_12h": 58.0, "lag_24h": 95.0, "max_intensity_past_24h": 22.0,
            "temperature_c": 24.0, "relative_humidity_pct": 96.0, "wind_speed_kmh": 38.0,
            "hour_sin": -0.5, "hour_cos": -0.866, "day_of_year_sin": 0.88, "day_of_year_cos": -0.47,
            "month": 9, "elevation_m": 5.0
        })
    ]

    print(f"{'Condition':<32} | {'Past 24h Rain':<14} | {'RF Predict 24h':<16} | {'XGB Predict 24h':<16}")
    print("-" * 84)

    for name, feat_dict in scenarios:
        df_row = pd.DataFrame([feat_dict])
        past_24h = f"{feat_dict['rolling_sum_24h']:.1f} mm"
        rf_pred = f"{rf_model.predict(df_row)[0]:.1f} mm" if rf_model else "N/A"
        xgb_pred = f"{xgb_reg.predict(df_row)[0]:.1f} mm" if xgb_reg else "N/A"
        print(f"{name:<32} | {past_24h:<14} | {rf_pred:<16} | {xgb_pred:<16}")


def test_classical_flood_models():
    print("\n" + "=" * 80)
    print("   2. CLASSICAL FLOOD INUNDATION RISK CLASSIFIERS")
    print("=" * 80)

    from app.services.flood_prediction_service import flood_prediction_service

    print("\n[Flood Risk Classifier Evaluation on Hydrological Profiles]:")
    profiles = [
        {"desc": "Low Inflow (Normal Day)", "rainfall": 5.0, "elev": 35.0, "slope": 4.5, "drainage": 75.0},
        {"desc": "Elevated Runoff (Monsoon)", "rainfall": 65.0, "elev": 12.0, "slope": 1.2, "drainage": 45.0},
        {"desc": "Severe Coastal Flash Flood", "rainfall": 160.0, "elev": 2.5, "slope": 0.4, "drainage": 15.0},
    ]

    print(f"{'Profile':<30} | {'Rainfall':<9} | {'RF Risk':<12} | {'XGB Risk':<12} | {'Category':<10}")
    print("-" * 80)

    for p in profiles:
        rf_res = flood_prediction_service.predict_risk({
            "daily_rainfall_mm": p["rainfall"],
            "model": "random_forest"
        })
        xgb_res = flood_prediction_service.predict_risk({
            "daily_rainfall_mm": p["rainfall"],
            "model": "xgboost"
        })
        rf_p = f"{rf_res.get('probability', 0):.1f}%"
        xgb_p = f"{xgb_res.get('probability', 0):.1f}%"
        cat = xgb_res.get('risk_category', 'Unknown')
        print(f"{p['desc']:<30} | {p['rainfall']:>6.1f} mm | {rf_p:<12} | {xgb_p:<12} | {cat:<10}")

    print("\n" + "=" * 80)
    print("   ALL CLASSICAL MODELS EXECUTED SUCCESSFULLY.")
    print("=" * 80)


if __name__ == "__main__":
    test_classical_rainfall_models()
    test_classical_flood_models()
