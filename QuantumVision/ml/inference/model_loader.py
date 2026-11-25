"""
QuantumVision Model Loader:
Loads and caches Classical (Random Forest, XGBoost) and
Quantum (VQC, QNN) trained models, scalers, and evaluation metrics.
"""
from pathlib import Path
import json
import joblib
import numpy as np
from xgboost import XGBClassifier
import pennylane as qml

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
ARTIFACTS_CLASSICAL = PROJECT_ROOT / "ml" / "artifacts" / "classical"
ARTIFACTS_QUANTUM = PROJECT_ROOT / "ml" / "artifacts" / "quantum"

def _find_file(filename: str, subdirs: list) -> Path:
    candidates = []
    for s in subdirs:
        p = s / filename
        if p.exists():
            candidates.append(p)
    if candidates:
        # Return the most recently modified file to strictly prevent loading stale models
        return max(candidates, key=lambda p: p.stat().st_mtime)
    return MODELS_DIR / filename

FEATURE_NAMES = [
    "sar_vv_db",
    "sar_vh_db",
    "sar_vv_vh_ratio",
    "sar_temporal_diff_db",
    "elevation_m",
    "slope_deg",
    "distance_to_waterway_km",
    "rainfall_accum_24h_mm",
    "rainfall_intensity_mm_hr"
]

QUANTUM_FEATURE_NAMES = [
    "sar_vv_db",
    "sar_temporal_diff_db",
    "elevation_m",
    "rainfall_accum_24h_mm"
]

class ModelRegistry:
    _instance = None

    def __init__(self):
        self.rf_model = None
        self.xgb_model = None
        self.scaler = None
        self.quantum_scaler = None
        self.vqc_weights = None
        self.qnn_weights = None
        self.evaluation_metrics = {}
        self.feature_importance = {}
        self.vqc_circuit_fn = None
        self.qnn_circuit_fn = None
        self.is_loaded = False
        self.load_all()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_all(self):
        try:
            # 1. Classical Scaler & Models
            scaler_path = _find_file("scaler.joblib", [ARTIFACTS_CLASSICAL, MODELS_DIR])
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)

            rf_path = _find_file("rf_flood_model.joblib", [ARTIFACTS_CLASSICAL, MODELS_DIR])
            if not rf_path.exists():
                rf_path = _find_file("rf_rainfall_flood.joblib", [ARTIFACTS_CLASSICAL, MODELS_DIR])
            if rf_path.exists():
                self.rf_model = joblib.load(rf_path)

            xgb_path = _find_file("xgb_flood_model.json", [ARTIFACTS_CLASSICAL, MODELS_DIR])
            if not xgb_path.exists():
                xgb_path = _find_file("xgb_rainfall_flood.json", [ARTIFACTS_CLASSICAL, MODELS_DIR])
            if xgb_path.exists():
                self.xgb_model = XGBClassifier()
                self.xgb_model.load_model(str(xgb_path))

            # 2. Quantum Scaler & Weights
            qscaler_path = _find_file("quantum_scaler.joblib", [ARTIFACTS_QUANTUM, MODELS_DIR])
            if qscaler_path.exists():
                self.quantum_scaler = joblib.load(qscaler_path)

            vqc_path = _find_file("vqc_weights.npy", [ARTIFACTS_QUANTUM, MODELS_DIR])
            if vqc_path.exists():
                self.vqc_weights = np.load(vqc_path)

            qnn_path = _find_file("qnn_weights.npy", [ARTIFACTS_QUANTUM, MODELS_DIR])
            if qnn_path.exists():
                self.qnn_weights = np.load(qnn_path)

            # 3. Metrics & Importances
            metrics_path = _find_file("evaluation_metrics.json", [ARTIFACTS_QUANTUM, MODELS_DIR])
            if metrics_path.exists():
                with open(metrics_path, "r") as f:
                    self.evaluation_metrics = json.load(f)

            fi_path = _find_file("feature_importance.json", [ARTIFACTS_QUANTUM, MODELS_DIR])
            if fi_path.exists():
                with open(fi_path, "r") as f:
                    self.feature_importance = json.load(f)


            # 4. Setup PennyLane circuits
            n_qubits = 4
            n_layers = 2
            dev = qml.device("default.qubit", wires=n_qubits)

            @qml.qnode(dev)
            def _vqc(weights, x):
                qml.AngleEmbedding(x, wires=range(n_qubits), rotation="Y")
                for l in range(n_layers):
                    for i in range(n_qubits):
                        qml.Rot(weights[l, i, 0], weights[l, i, 1], weights[l, i, 2], wires=i)
                    for i in range(n_qubits):
                        qml.CNOT(wires=[i, (i + 1) % n_qubits])
                return qml.expval(qml.PauliZ(0))

            @qml.qnode(dev)
            def _qnn(weights, x):
                qml.AngleEmbedding(x, wires=range(n_qubits), rotation="Z")
                qml.AngleEmbedding(x, wires=range(n_qubits), rotation="X")
                for l in range(n_layers):
                    for i in range(n_qubits):
                        qml.RY(weights[l, i, 0], wires=i)
                        qml.RZ(weights[l, i, 1], wires=i)
                    for i in range(n_qubits):
                        qml.CNOT(wires=[i, (i + 1) % n_qubits])
                return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

            self.vqc_circuit_fn = _vqc
            self.qnn_circuit_fn = _qnn
            self.is_loaded = True
            print("[ModelRegistry] Classical and Quantum models loaded successfully.")
        except Exception as e:
            print(f"[ModelRegistry] Error loading models: {e}")

registry = ModelRegistry.get_instance()