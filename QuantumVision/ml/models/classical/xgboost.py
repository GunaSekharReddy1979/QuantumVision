"""
XGBoost Model Wrapper for Flood Risk Prediction.
Loads trained XGBoost classifier and provides standard predict and predict_proba interfaces.
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import joblib
from xgboost import XGBClassifier

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ARTIFACTS_DIR = PROJECT_ROOT / "ml" / "artifacts" / "classical"
LEGACY_DIR = PROJECT_ROOT / "ml" / "models"

class XGBoostFloodModel:
    def __init__(self, model_path: Optional[Path] = None, scaler_path: Optional[Path] = None):
        self.model_path = model_path or (ARTIFACTS_DIR / "xgb_rainfall_flood.json")
        if not self.model_path.exists():
            self.model_path = ARTIFACTS_DIR / "xgb_flood_model.json"
        if not self.model_path.exists():
            self.model_path = LEGACY_DIR / "xgb_rainfall_flood.json"

        self.scaler_path = scaler_path or (ARTIFACTS_DIR / "scaler.joblib")
        if not self.scaler_path.exists():
            self.scaler_path = LEGACY_DIR / "scaler.joblib"

        self.model = None
        self.scaler = None
        self.load()

    def load(self):
        if self.model_path.exists():
            self.model = XGBClassifier()
            self.model.load_model(str(self.model_path))
        if self.scaler_path.exists():
            self.scaler = joblib.load(self.scaler_path)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("XGBoost model is not loaded.")
        if self.scaler is not None and X.shape[1] == getattr(self.scaler, "n_features_in_", X.shape[1]):
            X = self.scaler.transform(X)
        return self.model.predict_proba(X)

    def predict(self, X: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("XGBoost model is not loaded.")
        if self.scaler is not None and X.shape[1] == getattr(self.scaler, "n_features_in_", X.shape[1]):
            X = self.scaler.transform(X)
        return self.model.predict(X)
