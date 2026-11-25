"""
QuantumVision Rainfall Forecasting Model Training Script.
Performs leak-free chronological training (2021-2023 Train, 2024-2025 Test)
for Persistence Baseline, Random Forest Regressor, and XGBoost Regressor.
Persists model artifacts and evaluation metrics to ml/models/rainfall/.
"""
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import sys
import time
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

from app.core.logger import logger
from app.services.rainfall_forecasting_service import (
    rainfall_forecasting_service,
    PROCESSED_WEATHER_DIR,
    MODELS_DIR,
    RF_MODEL_PATH,
    XGB_MODEL_PATH,
    METRICS_PATH,
    FEATURE_COLS,
    TARGET_COL
)

def run_training():
    t0 = time.time()
    print("1. Loading processed multi-point dataset...")
    combined_file = PROCESSED_WEATHER_DIR / "srikakulam_hourly_all_points.parquet"
    if not combined_file.exists():
        raise FileNotFoundError(f"Missing {combined_file}")
    
    raw_df = pd.read_parquet(combined_file)
    print(f"Loaded raw records: {len(raw_df)}")

    print("2. Generating leak-free features point-by-point...")
    processed_dfs = []
    for pt_id, group in raw_df.groupby("point_id"):
        p_df = rainfall_forecasting_service.engineer_features(group)
        processed_dfs.append(p_df)
    
    full_df = pd.concat(processed_dfs, ignore_index=True)
    valid_df = full_df.dropna(subset=[TARGET_COL] + FEATURE_COLS).copy()
    print(f"Total valid samples: {len(valid_df)}")

    # Chronological Split
    train_mask = (valid_df["timestamp"] >= "2021-01-01") & (valid_df["timestamp"] < "2024-01-01")
    test_mask = (valid_df["timestamp"] >= "2024-01-01")

    df_train = valid_df[train_mask]
    df_test = valid_df[test_mask]
    print(f"Full Train: {len(df_train)} (2021-2023), Full Test: {len(df_test)} (2024-2025)")

    # Sample for training efficiency and memory stability
    X_train = df_train.iloc[::3][FEATURE_COLS]
    y_train = df_train.iloc[::3][TARGET_COL]

    X_test = df_test.iloc[::2][FEATURE_COLS]
    y_test = df_test.iloc[::2][TARGET_COL]
    print(f"Subsampled Train: {len(X_train)}, Subsampled Test: {len(X_test)}")

    # Model A: Baseline Persistence
    print("3. Evaluating Persistence Baseline...")
    y_pred_baseline = X_test["rolling_sum_24h"].values
    base_mae = float(mean_absolute_error(y_test, y_pred_baseline))
    base_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_baseline)))
    base_r2 = float(r2_score(y_test, y_pred_baseline))

    # Model B: Random Forest Regressor
    print("4. Training Random Forest Regressor (60 estimators)...")
    rf = RandomForestRegressor(
        n_estimators=60,
        max_depth=10,
        min_samples_leaf=5,
        n_jobs=1,
        random_state=42
    )
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    rf_mae = float(mean_absolute_error(y_test, y_pred_rf))
    rf_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_rf)))
    rf_r2 = float(r2_score(y_test, y_pred_rf))

    # Model C: XGBoost Regressor
    print("5. Training XGBoost Regressor (80 estimators)...")
    xgb_reg = xgb.XGBRegressor(
        n_estimators=80,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=1
    )
    xgb_reg.fit(X_train, y_train)
    y_pred_xgb = xgb_reg.predict(X_test)
    xgb_mae = float(mean_absolute_error(y_test, y_pred_xgb))
    xgb_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_xgb)))
    xgb_r2 = float(r2_score(y_test, y_pred_xgb))

    # Heavy rain evaluation (> 20mm in 24h)
    heavy_mask = (y_test.values >= 20.0)
    heavy_count = int(np.sum(heavy_mask))
    if heavy_count > 10:
        heavy_y = y_test.values[heavy_mask]
        rf_heavy_mae = float(mean_absolute_error(heavy_y, y_pred_rf[heavy_mask]))
        xgb_heavy_mae = float(mean_absolute_error(heavy_y, y_pred_xgb[heavy_mask]))
        base_heavy_mae = float(mean_absolute_error(heavy_y, y_pred_baseline[heavy_mask]))
    else:
        rf_heavy_mae = None
        xgb_heavy_mae = None
        base_heavy_mae = None

    importances = []
    for col, imp in zip(FEATURE_COLS, xgb_reg.feature_importances_):
        importances.append({"feature": col, "importance": round(float(imp), 4)})
    importances = sorted(importances, key=lambda x: x["importance"], reverse=True)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(rf, RF_MODEL_PATH)
    xgb_reg.save_model(str(XGB_MODEL_PATH))

    best_model_id = "xgboost" if xgb_rmse <= rf_rmse else "random_forest"
    if base_rmse < min(xgb_rmse, rf_rmse):
        best_model_id = "baseline_persistence"

    report = {
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "training_duration_seconds": round(time.time() - t0, 1),
        "chronological_splits": {
            "train_period": "2021-01-01 to 2023-12-31",
            "train_samples": len(X_train),
            "test_period": "2024-01-01 to 2025-12-31",
            "test_samples": len(X_test),
            "heavy_rain_events_tested": heavy_count
        },
        "models": {
            "baseline_persistence": {
                "model_name": "Persistence Baseline (Previous 24h)",
                "mae_mm": round(base_mae, 3),
                "rmse_mm": round(base_rmse, 3),
                "r2_score": round(base_r2, 4),
                "heavy_rain_mae_mm": round(base_heavy_mae, 3) if base_heavy_mae else "N/A"
            },
            "random_forest": {
                "model_name": "Random Forest Regressor",
                "mae_mm": round(rf_mae, 3),
                "rmse_mm": round(rf_rmse, 3),
                "r2_score": round(rf_r2, 4),
                "heavy_rain_mae_mm": round(rf_heavy_mae, 3) if rf_heavy_mae else "N/A"
            },
            "xgboost": {
                "model_name": "XGBoost Regressor",
                "mae_mm": round(xgb_mae, 3),
                "rmse_mm": round(xgb_rmse, 3),
                "r2_score": round(xgb_r2, 4),
                "heavy_rain_mae_mm": round(xgb_heavy_mae, 3) if xgb_heavy_mae else "N/A"
            },
            "quantum_regression": {
                "model_name": "Quantum VQC Regressor",
                "status": "EXPERIMENTAL / NOT_IMPLEMENTED",
                "mae_mm": "N/A",
                "rmse_mm": "N/A",
                "r2_score": "N/A",
                "note": (
                    "Quantum VQC in the repository is a 4-qubit binary classification circuit "
                    "for spatial flood-risk demarcation. Continuous quantum rainfall forecasting "
                    "is not implemented in this version. No artificial metrics are fabricated."
                )
            }
        },
        "best_model": best_model_id,
        "top_feature_importance": importances[:8],
        "evaluation_limitation_note": (
            "Models evaluated on chronological test split (2024-2025) using reanalysis atmospheric records. "
            "Operational performance depends on Open-Meteo numerical weather prediction accuracy."
        )
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\nSUCCESSFULLY COMPLETED TRAINING!")
    print(f"Best model: {best_model_id}")
    print(f"Baseline MAE: {round(base_mae, 3)} mm, RMSE: {round(base_rmse, 3)} mm, R2: {round(base_r2, 4)}")
    print(f"Random Forest MAE: {round(rf_mae, 3)} mm, RMSE: {round(rf_rmse, 3)} mm, R2: {round(rf_r2, 4)}")
    print(f"XGBoost MAE: {round(xgb_mae, 3)} mm, RMSE: {round(xgb_rmse, 3)} mm, R2: {round(xgb_r2, 4)}")
    return report

if __name__ == "__main__":
    run_training()
