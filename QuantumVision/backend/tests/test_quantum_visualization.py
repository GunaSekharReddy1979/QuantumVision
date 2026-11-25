"""
Test suite for Quantum Circuit Visualization, Quantum Model Verification,
and Rainfall Target Integrity in QuantumVision.
"""
import sys
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

# Ensure QuantumVision root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(PROJECT_ROOT / "backend") not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from ml.models.quantum.vqc import VariationalQuantumClassifier, PENNYLANE_AVAILABLE as VQC_PL
from ml.models.quantum.qnn import QuantumNeuralNetwork, PENNYLANE_AVAILABLE as QNN_PL
from app.services.rainfall_forecasting_service import rainfall_forecasting_service, TARGET_COL, FEATURE_COLS
from scripts.visualize_quantum_circuits import visualize_vqc, visualize_qnn, DOCS_FIG_DIR, ARTIFACTS_FIG_DIR


def test_vqc_circuit_definition_and_execution():
    """Verify VQC device (default.qubit 4 wires), weight shape (2, 4, 3), and score in [0, 1]."""
    vqc = VariationalQuantumClassifier(num_qubits=4, num_layers=2)
    assert vqc.num_qubits == 4
    assert vqc.num_layers == 2
    assert vqc.weights is not None
    assert vqc.weights.shape == (2, 4, 3)
    assert vqc.scaler is not None
    assert vqc.scaler.n_features_in_ == 4

    sample = np.array([-12.5, 3.8, 14.2, 55.0])
    score = vqc.predict_risk(sample)
    assert isinstance(score, float)
    assert 0.0 <= score <= 1.0
    assert not np.isnan(score)


def test_qnn_circuit_definition_and_execution():
    """Verify QNN device (default.qubit 4 wires), weight shape (2, 4, 2), and score in [0, 1]."""
    qnn = QuantumNeuralNetwork(num_qubits=4, num_layers=2)
    assert qnn.num_qubits == 4
    assert qnn.num_layers == 2
    assert qnn.weights is not None
    assert qnn.weights.shape == (2, 4, 2)
    assert qnn.scaler is not None
    assert qnn.scaler.n_features_in_ == 4

    sample = np.array([-12.5, 3.8, 14.2, 55.0])
    score = qnn.predict_risk(sample)
    assert isinstance(score, float)
    assert 0.0 <= score <= 1.0
    assert not np.isnan(score)


def test_quantum_circuit_drawings_generated():
    """Verify that qml.draw and qml.draw_mpl produce valid PNG diagrams and text files."""
    assert visualize_vqc() is True
    assert visualize_qnn() is True

    vqc_png = DOCS_FIG_DIR / "vqc_circuit.png"
    qnn_png = DOCS_FIG_DIR / "qnn_circuit.png"
    vqc_txt = DOCS_FIG_DIR / "vqc_circuit.txt"
    qnn_txt = DOCS_FIG_DIR / "qnn_circuit.txt"

    assert vqc_png.exists() and vqc_png.stat().st_size > 10000
    assert qnn_png.exists() and qnn_png.stat().st_size > 10000
    assert vqc_txt.exists() and vqc_txt.stat().st_size > 100
    assert qnn_txt.exists() and qnn_txt.stat().st_size > 100


def test_rainfall_target_forward_accumulation_math():
    """Verify mathematically that target is strictly sum of future precipitation over (t+1 .. t+24)."""
    # Create synthetic series of 48 hours where precipitation is exactly 1.0 mm per hour
    dates = pd.date_range("2024-01-01", periods=48, freq="h")
    df = pd.DataFrame({
        "timestamp": dates,
        "precipitation_mm": [1.0] * 48,
        "temperature_c": [25.0] * 48,
        "relative_humidity_pct": [80.0] * 48,
        "wind_speed_kmh": [10.0] * 48,
        "elevation_m": [20.0] * 48
    })

    p_df = rainfall_forecasting_service.engineer_features(df)

    # For any t from 0 to 23, the sum over next 24 hours (each 1.0 mm) must be exactly 24.0 mm
    for i in range(24):
        assert p_df.loc[i, TARGET_COL] == 24.0

    # The last 24 rows must have NaN because future 24h observations do not exist
    for i in range(24, 48):
        assert pd.isna(p_df.loc[i, TARGET_COL])
