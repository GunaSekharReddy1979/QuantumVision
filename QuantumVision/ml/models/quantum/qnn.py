"""
Quantum Neural Network (QNN) for Flood Risk Prediction.
Implements a 4-qubit Quantum Neural Network layer evaluated via PennyLane simulator
with expectations measured across all wires and mapped to probabilistic risk.
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import joblib

try:
    import pennylane as qml
    PENNYLANE_AVAILABLE = True
except ImportError:
    PENNYLANE_AVAILABLE = False

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ARTIFACTS_DIR = PROJECT_ROOT / "ml" / "artifacts" / "quantum"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
LEGACY_DIR = PROJECT_ROOT / "ml" / "models"

class QuantumNeuralNetwork:
    def __init__(self, num_qubits: int = 4, num_layers: int = 2):
        self.num_qubits = num_qubits
        self.num_layers = num_layers
        self.weights = None
        self.scaler = None
        self.circuit_fn = None
        self.load()

    def load(self):
        # Load the latest genuinely trained weights across candidate folders
        candidates_w = [p / "qnn_weights.npy" for p in [MODELS_DIR, ARTIFACTS_DIR] if (p / "qnn_weights.npy").exists()]
        if candidates_w:
            weights_path = max(candidates_w, key=lambda p: p.stat().st_mtime)
            self.weights = np.load(weights_path)

        candidates_s = [p / "quantum_scaler.joblib" for p in [MODELS_DIR, ARTIFACTS_DIR] if (p / "quantum_scaler.joblib").exists()]
        if candidates_s:
            scaler_path = max(candidates_s, key=lambda p: p.stat().st_mtime)
            self.scaler = joblib.load(scaler_path)

        if PENNYLANE_AVAILABLE:
            dev = qml.device("default.qubit", wires=self.num_qubits)

            @qml.qnode(dev)
            def _circuit(weights, x):
                qml.AngleEmbedding(x, wires=range(self.num_qubits), rotation="Z")
                qml.AngleEmbedding(x, wires=range(self.num_qubits), rotation="X")
                for l in range(self.num_layers):
                    for i in range(self.num_qubits):
                        qml.RY(weights[l, i, 0], wires=i)
                        qml.RZ(weights[l, i, 1], wires=i)
                    for i in range(self.num_qubits):
                        qml.CNOT(wires=[i, (i + 1) % self.num_qubits])
                return [qml.expval(qml.PauliZ(i)) for i in range(self.num_qubits)]

            self.circuit_fn = _circuit

    def predict_risk(self, x_4features: np.ndarray) -> float:
        """
        Takes 4 quantum-mapped features.
        Returns risk score in [0.0, 1.0].
        """
        if self.scaler is not None:
            x_scaled = self.scaler.transform(x_4features.reshape(1, -1))[0]
        else:
            x_scaled = x_4features

        if self.circuit_fn is not None and self.weights is not None:
            node_outs = np.array(self.circuit_fn(self.weights, x_scaled))
            val = float(np.mean(node_outs))
            return float(np.clip(1.0 / (1.0 + np.exp(-2.5 * val)), 0.0, 1.0))
        else:
            norm_val = np.mean(x_scaled)
            return float(np.clip(1.0 / (1.0 + np.exp(-norm_val)), 0.0, 1.0))


if __name__ == "__main__":
    import sys
    print("=" * 60)
    print("Quantum Neural Network (QNN) - Srikakulam Flood Risk")
    print("=" * 60)
    print(f"PennyLane available: {PENNYLANE_AVAILABLE}")
    qnn = QuantumNeuralNetwork(num_qubits=4, num_layers=2)
    print(f"Loaded weights shape: {qnn.weights.shape if qnn.weights is not None else 'None'}")
    print(f"Loaded scaler: {'Yes' if qnn.scaler is not None else 'No'}")
    
    # Test sample: [SAR VV (dB), SAR diff (dB), Elevation (m), Rainfall (mm)]
    sample = np.array([-12.5, 3.8, 14.2, 55.0])
    risk = qnn.predict_risk(sample)
    print("\nInput Features [SAR VV, SAR diff, Elevation, Rainfall]:", sample)
    print(f"Predicted Flood Risk Probability (QNN): {risk:.4f} ({risk * 100:.1f}%)")
    print("=" * 60)

