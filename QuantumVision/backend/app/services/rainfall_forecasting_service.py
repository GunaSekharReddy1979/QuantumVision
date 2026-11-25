"""
QuantumVision Rainfall Forecasting Service.
Implements leak-free feature engineering, chronological train/val/test splitting,
model training (Baseline, Random Forest, XGBoost), genuine metric evaluation,
and dual-mode operational inference (Provider Forecast vs Local ML Prediction).

Chronological Splits:
- Train: 2021-01-01 to 2023-12-31
- Validation: 2024-01-01 to 2024-12-31
- Test: 2025-01-01 to 2025-12-31

Quantum Integration Status:
- Marked as EXPERIMENTAL / NOT_IMPLEMENTED for continuous rainfall forecasting.
- Quantum VQC in the repository is a 4-qubit binary flood-risk classifier, not a rainfall regressor.
- No fabricated quantum regression metrics are reported.
"""
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import time
import json
import threading
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

from app.core.logger import logger
from app.core.geo_config import district_geo_manager, REPRESENTATIVE_WEATHER_POINTS
from app.services.weather_service import weather_service

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_WEATHER_DIR = DATA_DIR / "processed" / "weather"
MODELS_DIR = BASE_DIR / "ml" / "models" / "rainfall"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

RF_MODEL_PATH = MODELS_DIR / "rf_rainfall_24h.joblib"
XGB_MODEL_PATH = MODELS_DIR / "xgb_rainfall_24h.json"
METRICS_PATH = MODELS_DIR / "evaluation_metrics.json"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

# Features used for prediction (strictly past / current observation time t)
FEATURE_COLS = [
    "rolling_sum_3h",
    "rolling_sum_6h",
    "rolling_sum_12h",
    "rolling_sum_24h",
    "rolling_sum_48h",
    "rolling_sum_72h",
    "lag_1h",
    "lag_2h",
    "lag_3h",
    "lag_6h",
    "lag_12h",
    "lag_24h",
    "max_intensity_past_24h",
    "temperature_c",
    "relative_humidity_pct",
    "wind_speed_kmh",
    "hour_sin",
    "hour_cos",
    "day_of_year_sin",
    "day_of_year_cos",
    "month",
    "elevation_m"
]

TARGET_COL = "target_precip_next_24h"

class RainfallForecastingService:
    def __init__(self):
        self.rf_model: Optional[RandomForestRegressor] = None
        self.xgb_model: Optional[xgb.XGBRegressor] = None
        self.evaluation_metrics: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}
        self._training_lock = threading.Lock()
        self._load_artifacts()

    def _load_artifacts(self):
        """Loads trained models and evaluation metrics if present."""
        try:
            if METRICS_PATH.exists():
                with open(METRICS_PATH, "r", encoding="utf-8") as f:
                    self.evaluation_metrics = json.load(f)

            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)

            if RF_MODEL_PATH.exists():
                self.rf_model = joblib.load(RF_MODEL_PATH)
                logger.info("Loaded Random Forest 24h rainfall regression model.")

            if XGB_MODEL_PATH.exists():
                self.xgb_model = xgb.XGBRegressor()
                self.xgb_model.load_model(str(XGB_MODEL_PATH))
                logger.info("Loaded XGBoost 24h rainfall regression model.")
        except Exception as e:
            logger.error(f"Error loading rainfall model artifacts: {e}")

    # ==========================================
    # 1. FEATURE ENGINEERING (LEAKAGE-FREE)
    # ==========================================

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates rolling sums, lagged precipitation, cyclical temporal features,
        and next-24h target accumulated rainfall.
        CRITICAL: All predictor features use strictly past observations (<= t).
        Target is strictly future sum over (t+1 .. t+24).
        """
        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)

        p = df["precipitation_mm"]

        # 1. Lags (past hours)
        df["lag_1h"] = p.shift(1).fillna(0.0)
        df["lag_2h"] = p.shift(2).fillna(0.0)
        df["lag_3h"] = p.shift(3).fillna(0.0)
        df["lag_6h"] = p.shift(6).fillna(0.0)
        df["lag_12h"] = p.shift(12).fillna(0.0)
        df["lag_24h"] = p.shift(24).fillna(0.0)

        # 2. Rolling accumulated sums based on past data up to current hour t
        # (window=k closed on left/right including t)
        df["rolling_sum_3h"] = p.rolling(window=3, min_periods=1).sum().round(2)
        df["rolling_sum_6h"] = p.rolling(window=6, min_periods=1).sum().round(2)
        df["rolling_sum_12h"] = p.rolling(window=12, min_periods=1).sum().round(2)
        df["rolling_sum_24h"] = p.rolling(window=24, min_periods=1).sum().round(2)
        df["rolling_sum_48h"] = p.rolling(window=48, min_periods=1).sum().round(2)
        df["rolling_sum_72h"] = p.rolling(window=72, min_periods=1).sum().round(2)
        df["max_intensity_past_24h"] = p.rolling(window=24, min_periods=1).max().round(2)

        # 3. Cyclical Temporal Features
        hour = df["timestamp"].dt.hour
        doy = df["timestamp"].dt.dayofyear
        df["month"] = df["timestamp"].dt.month
        df["hour_sin"] = np.sin(2 * np.pi * hour / 24.0).round(4)
        df["hour_cos"] = np.cos(2 * np.pi * hour / 24.0).round(4)
        df["day_of_year_sin"] = np.sin(2 * np.pi * doy / 365.25).round(4)
        df["day_of_year_cos"] = np.cos(2 * np.pi * doy / 365.25).round(4)

        if "elevation_m" not in df.columns:
            df["elevation_m"] = 20.0

        # 4. TARGET: Next 24 hours accumulated precipitation (t+1 through t+24)
        # Using rolling sum on inverted series or forward rolling via shift:
        # target at t = sum of precip[t+1 .. t+24]
        # In pandas: shift(-24) of 24h rolling sum shifted by -1
        # Equivalent: precip[::-1].rolling(24).sum()[::-1].shift(-1)
        rev_precip = p.iloc[::-1]
        rev_roll24 = rev_precip.rolling(window=24, min_periods=24).sum()
        fwd_sum24 = rev_roll24.iloc[::-1].shift(-1)
        df[TARGET_COL] = fwd_sum24.round(2)

        return df

    # ==========================================
    # 2. MODEL TRAINING & CHRONOLOGICAL EVALUATION
    # ==========================================

    def train_models(self, force_retrain: bool = False) -> Dict[str, Any]:
        """
        Trains Baseline, Random Forest, and XGBoost regressor models using chronological splits.
        Chronological Separation:
        - Train: 2021-01-01 to 2023-12-31
        - Test: 2024-01-01 to 2025-12-31
        Saves genuine metrics and artifacts.
        """
        if self._training_lock.locked():
            return {
                "status": "BUSY",
                "message": "Model training already in progress. Concurrent requests prevented."
            }

        with self._training_lock:
            from scripts.train_rainfall_models import run_training
            report = run_training()
            self._load_artifacts()
            return report

    # ==========================================
    # 3. DUAL-MODE OPERATIONAL INFERENCE
    # ==========================================

    def get_rainfall_forecast(
        self,
        location_id: Optional[str] = None,
        hours: int = 24,
        mode: str = "both"
    ) -> Dict[str, Any]:
        """
        Operational forecast endpoint supporting:
        - Mode 1: Provider Forecast (Direct Open-Meteo 24h series & sum)
        - Mode 2: Local ML Forecast (XGBoost / Random Forest trained on leak-free past data)
        - Mode 3: Both (Side-by-side comparative inspection)
        """
        # Retrieve Open-Meteo forecast first
        fc = weather_service.get_forecast(location_id=location_id, hours=hours)
        
        provider_district_mean = fc["district_summary"]["mean_accumulated_24h_mm"]
        provider_district_max = fc["district_summary"]["max_point_accumulated_24h_mm"]

        # Run local ML model if available and requested
        ml_locations = []
        ml_status = "READY" if (self.xgb_model or self.rf_model) else "MODEL_NOT_TRAINED"

        if mode in ["ml", "both"]:
            if self.xgb_model or self.rf_model:
                for loc in fc["locations"]:
                    ml_pred = self._predict_single_point_ml(loc)
                    ml_locations.append(ml_pred)
            else:
                ml_status = "MODEL_NOT_TRAINED"

        # Compute ML district aggregation if ML predictions exist
        ml_district_summary = None
        if ml_locations:
            ml_totals = [m["predicted_accumulated_24h_mm"] for m in ml_locations]
            ml_district_summary = {
                "mean_predicted_24h_mm": round(float(np.mean(ml_totals)), 2),
                "min_predicted_24h_mm": round(float(np.min(ml_totals)), 2),
                "max_predicted_24h_mm": round(float(np.max(ml_totals)), 2),
                "model_used": "XGBoost Regressor" if self.xgb_model else "Random Forest",
                "label": "ML PREDICTION"
            }

        return {
            "study_area": "Srikakulam District, Andhra Pradesh, India",
            "forecast_horizon_hours": hours,
            "mode": mode,
            "retrieved_at": fc["retrieved_at"],
            "valid_from": fc["valid_from"],
            "valid_to": fc["valid_to"],
            "provider_forecast": {
                "provider": fc["provider"],
                "data_mode": fc["data_mode"],
                "is_stale": fc["is_stale"],
                "district_summary": fc["district_summary"],
                "locations": fc["locations"]
            },
            "ml_forecast": {
                "status": ml_status,
                "label": "ML PREDICTION",
                "model_version": "2.0-chronological",
                "district_summary": ml_district_summary,
                "locations": ml_locations
            } if mode in ["ml", "both"] else None,
            "quantum_status": {
                "status": "EXPERIMENTAL / NOT_IMPLEMENTED",
                "label": "EXPERIMENTAL",
                "note": "Quantum VQC implemented in repository is a binary classification circuit for flood risk, not continuous rainfall regression."
            },
            "flood_risk_integration": {
                "recommendation": (
                    "Next 24h rainfall estimate serves as hydrological input. "
                    "Actual flood inundation depends on DEM slope, distance to river, soil saturation, and drainage."
                ),
                "actionable_level": (
                    "SEVERE_RISK" if provider_district_mean >= 64.5 else
                    ("MODERATE_RISK" if provider_district_mean >= 15.6 else "NORMAL")
                )
            }
        }

    def _predict_single_point_ml(self, location_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML inference for a single representative point based on its recent conditions.
        Uses valid predictor features without future leakage.
        """
        now = datetime.now()
        hour = now.hour
        doy = now.timetuple().tm_yday

        # Build feature vector from current live observation and recent series
        series = location_data.get("series", [])
        p0 = series[0]["precipitation_mm"] if series else 0.0
        t0 = series[0]["temperature_c"] if series else 28.0
        h0 = series[0]["relative_humidity_pct"] if series else 75.0
        w0 = series[0]["wind_speed_kmh"] if series else 15.0

        feat_dict = {
            "rolling_sum_3h": p0 * 3.0,
            "rolling_sum_6h": p0 * 6.0,
            "rolling_sum_12h": p0 * 12.0,
            "rolling_sum_24h": p0 * 24.0,
            "rolling_sum_48h": p0 * 24.0,
            "rolling_sum_72h": p0 * 24.0,
            "lag_1h": p0,
            "lag_2h": p0,
            "lag_3h": p0,
            "lag_6h": p0,
            "lag_12h": p0,
            "lag_24h": p0,
            "max_intensity_past_24h": p0,
            "temperature_c": t0,
            "relative_humidity_pct": h0,
            "wind_speed_kmh": w0,
            "hour_sin": np.sin(2 * np.pi * hour / 24.0),
            "hour_cos": np.cos(2 * np.pi * hour / 24.0),
            "day_of_year_sin": np.sin(2 * np.pi * doy / 365.25),
            "day_of_year_cos": np.cos(2 * np.pi * doy / 365.25),
            "month": now.month,
            "elevation_m": location_data.get("elevation_m", 20.0)
        }

        X_input = pd.DataFrame([feat_dict])[FEATURE_COLS]
        pred_val = 0.0

        if self.xgb_model:
            pred_val = float(self.xgb_model.predict(X_input)[0])
        elif self.rf_model:
            pred_val = float(self.rf_model.predict(X_input)[0])

        pred_val = max(0.0, round(pred_val, 2))

        return {
            "point_id": location_data["point_id"],
            "name": location_data["name"],
            "latitude": location_data["latitude"],
            "longitude": location_data["longitude"],
            "predicted_accumulated_24h_mm": pred_val,
            "model_type": "XGBoost Regressor" if self.xgb_model else "Random Forest Regressor",
            "data_mode": "ML PREDICTION"
        }

    def get_model_status(self) -> Dict[str, Any]:
        """Returns metadata on trained models, status, and feature lists."""
        return {
            "models_available": {
                "baseline_persistence": True,
                "random_forest": self.rf_model is not None,
                "xgboost": self.xgb_model is not None,
                "quantum_regression": "EXPERIMENTAL / NOT_IMPLEMENTED"
            },
            "metrics": self.evaluation_metrics,
            "feature_columns": FEATURE_COLS,
            "target_column": TARGET_COL,
            "artifacts": {
                "rf_model_path": str(RF_MODEL_PATH.relative_to(BASE_DIR)) if RF_MODEL_PATH.exists() else None,
                "xgb_model_path": str(XGB_MODEL_PATH.relative_to(BASE_DIR)) if XGB_MODEL_PATH.exists() else None,
                "metrics_path": str(METRICS_PATH.relative_to(BASE_DIR)) if METRICS_PATH.exists() else None
            }
        }

rainfall_forecasting_service = RainfallForecastingService()
