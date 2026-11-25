"""
Runner script for Quantum Neural Network (QNN) and Variational Quantum Classifier (VQC).
Evaluates both quantum circuits using PennyLane 4-qubit simulators on Srikakulam hydrological scenarios.
"""
import sys
from pathlib import Path
import numpy as np

# Ensure QuantumVision root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.models.quantum.vqc import VariationalQuantumClassifier, PENNYLANE_AVAILABLE
from ml.models.quantum.qnn import QuantumNeuralNetwork

def main():
    print("=" * 72)
    print("   QUANTUMVISION — QUANTUM MODEL EXECUTION ENGINE (PENNYLANE)")
    print("=" * 72)
    print(f"Backend Simulator : default.qubit (4 Wires)")
    print(f"PennyLane Library : {'INSTALLED' if PENNYLANE_AVAILABLE else 'NOT FOUND'}")
    print("=" * 72)

    # Initialize models
    print("\n[1/3] Initializing Quantum Classifiers...")
    vqc = VariationalQuantumClassifier(num_qubits=4, num_layers=2)
    qnn = QuantumNeuralNetwork(num_qubits=4, num_layers=2)

    print(f" -> VQC: Weights {vqc.weights.shape if vqc.weights is not None else 'None'} | Scaler: {'Loaded' if vqc.scaler is not None else 'None'}")
    print(f" -> QNN: Weights {qnn.weights.shape if qnn.weights is not None else 'None'} | Scaler: {'Loaded' if qnn.scaler is not None else 'None'}")

    # Scenarios for Srikakulam Flood Risk:
    # Features: [Sentinel-1 SAR VV (dB), SAR Diff (dB), DEM Elevation (m), Rainfall 24h (mm)]
    scenarios = [
        ("Dry Season / Normal Lowland", np.array([-8.0, 0.5, 45.0, 2.0])),
        ("Moderate Monsoonal Rainfall", np.array([-12.5, 3.8, 14.2, 55.0])),
        ("Severe Inundation / Flash Flood", np.array([-18.0, 8.5, 3.5, 145.0])),
    ]

    print("\n[2/3] Simulating Quantum Circuits Across Test Scenarios...")
    print(f"{'Scenario':<34} | {'SAR VV':<7} | {'Diff':<5} | {'Elev':<5} | {'Rain':<6} | {'VQC Score (Uncal.)':<18} | {'QNN Score (Uncal.)':<18}")
    print("-" * 105)

    for name, features in scenarios:
        vqc_risk = vqc.predict_risk(features)
        qnn_risk = qnn.predict_risk(features)
        print(f"{name:<34} | {features[0]:>6.1f} | {features[1]:>4.1f} | {features[2]:>4.1f} | {features[3]:>5.1f} | {vqc_risk*100:>15.1f}% | {qnn_risk*100:>15.1f}%")

    print("\n[3/3] Quantum Circuit Execution Complete.")
    print("=" * 72)

if __name__ == "__main__":
    main()
