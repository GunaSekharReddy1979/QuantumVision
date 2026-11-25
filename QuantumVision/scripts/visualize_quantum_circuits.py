"""
QuantumVision — Quantum Circuit Visualization Script.
Renders and exports circuit diagrams for Variational Quantum Classifier (VQC)
and Quantum Neural Network (QNN) using native PennyLane QNode drawings.

Outputs:
- Terminal UTF-8 text representations
- High-resolution publication-quality PNG diagrams (via qml.draw_mpl / matplotlib)
- Exported text circuit files
"""
import os
import sys
from pathlib import Path
import numpy as np

# Set UTF-8 encoding for standard output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Configure project path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

DOCS_FIG_DIR = PROJECT_ROOT / "docs" / "figures" / "quantum"
ARTIFACTS_FIG_DIR = PROJECT_ROOT / "ml" / "artifacts" / "quantum" / "figures"
DOCS_FIG_DIR.mkdir(parents=True, exist_ok=True)
ARTIFACTS_FIG_DIR.mkdir(parents=True, exist_ok=True)

try:
    import pennylane as qml
    import matplotlib
    import matplotlib.pyplot as plt
    matplotlib.use("Agg")  # Non-interactive backend
    from ml.models.quantum.vqc import VariationalQuantumClassifier, PENNYLANE_AVAILABLE as VQC_PL
    from ml.models.quantum.qnn import QuantumNeuralNetwork, PENNYLANE_AVAILABLE as QNN_PL
except Exception as e:
    print(f"[ERROR] Failed to import quantum dependencies: {e}", file=sys.stderr)
    sys.exit(1)


def visualize_vqc() -> bool:
    print("\n" + "=" * 76)
    print(" 1. VARIATIONAL QUANTUM CLASSIFIER (VQC) — CIRCUIT VISUALIZATION")
    print("=" * 76)

    try:
        vqc = VariationalQuantumClassifier(num_qubits=4, num_layers=2)
        if not vqc.circuit_fn:
            print("[ERROR] VQC circuit function not initialized.", file=sys.stderr)
            return False

        print(f" -> Device: default.qubit (4 wires)")
        print(f" -> Loaded Weights Shape: {vqc.weights.shape if vqc.weights is not None else 'None'}")
        print(f" -> Encoding: AngleEmbedding(rotation='Y')")
        print(f" -> Variational Layers: Rot(phi, theta, omega) + Circular Entangling CNOTs")
        print(f" -> Measurement: PauliZ(wire=0)")

        # Realistic 4-feature input scaled sample: [SAR VV, Diff, Elev, Rain]
        sample_x = np.array([0.45, 0.62, 0.28, 0.75])

        # 1. Terminal ASCII/Unicode Diagram
        text_diagram = qml.draw(vqc.circuit_fn)(vqc.weights, sample_x)
        print("\n--- Terminal Circuit Representation ---")
        print(text_diagram)

        # Save Text File
        text_out_path = DOCS_FIG_DIR / "vqc_circuit.txt"
        with open(text_out_path, "w", encoding="utf-8") as f:
            f.write("QuantumVision — Variational Quantum Classifier (VQC) Circuit\n")
            f.write("Wires: 4, Layers: 2, Gates: AngleEmbedding(Y), Rot, CNOT, expval(Z0)\n")
            f.write("=" * 76 + "\n")
            f.write(text_diagram + "\n")
        print(f"\n[OK] Text diagram saved to: {text_out_path}")

        # 2. Matplotlib Graphical Diagram
        fig, ax = qml.draw_mpl(vqc.circuit_fn, style="pennylane")(vqc.weights, sample_x)
        ax.set_title("QuantumVision — Variational Quantum Classifier (VQC)\n4 Qubits, 2 Variational Rot+CNOT Layers, Z0 Expectation", fontsize=11, pad=12)
        
        png_out_path = DOCS_FIG_DIR / "vqc_circuit.png"
        fig.savefig(png_out_path, dpi=300, bbox_inches="tight")
        
        # Mirror to artifacts directory
        artifact_png = ARTIFACTS_FIG_DIR / "vqc_circuit.png"
        fig.savefig(artifact_png, dpi=300, bbox_inches="tight")
        plt.close(fig)

        print(f"[OK] High-resolution PNG saved to: {png_out_path}")
        print(f"[OK] Mirrored to: {artifact_png}")
        return True

    except Exception as e:
        print(f"[ERROR] Failed to render VQC circuit: {e}", file=sys.stderr)
        return False


def visualize_qnn() -> bool:
    print("\n" + "=" * 76)
    print(" 2. QUANTUM NEURAL NETWORK (QNN) — CIRCUIT VISUALIZATION")
    print("=" * 76)

    try:
        qnn = QuantumNeuralNetwork(num_qubits=4, num_layers=2)
        if not qnn.circuit_fn:
            print("[ERROR] QNN circuit function not initialized.", file=sys.stderr)
            return False

        print(f" -> Device: default.qubit (4 wires)")
        print(f" -> Loaded Weights Shape: {qnn.weights.shape if qnn.weights is not None else 'None'}")
        print(f" -> Encoding: AngleEmbedding(Z) + AngleEmbedding(X)")
        print(f" -> Variational Layers: RY + RZ + Circular Entangling CNOTs")
        print(f" -> Measurement: [PauliZ(i) for i in 0..3] -> Sigmoid Pooling")

        # Realistic 4-feature input scaled sample: [SAR VV, Diff, Elev, Rain]
        sample_x = np.array([0.45, 0.62, 0.28, 0.75])

        # 1. Terminal ASCII/Unicode Diagram
        text_diagram = qml.draw(qnn.circuit_fn)(qnn.weights, sample_x)
        print("\n--- Terminal Circuit Representation ---")
        print(text_diagram)

        # Save Text File
        text_out_path = DOCS_FIG_DIR / "qnn_circuit.txt"
        with open(text_out_path, "w", encoding="utf-8") as f:
            f.write("QuantumVision — Quantum Neural Network (QNN) Circuit\n")
            f.write("Wires: 4, Layers: 2, Gates: AngleEmbedding(Z), AngleEmbedding(X), RY, RZ, CNOT, expval(Z0..3)\n")
            f.write("=" * 76 + "\n")
            f.write(text_diagram + "\n")
        print(f"\n[OK] Text diagram saved to: {text_out_path}")

        # 2. Matplotlib Graphical Diagram
        fig, ax = qml.draw_mpl(qnn.circuit_fn, style="pennylane")(qnn.weights, sample_x)
        ax.set_title("QuantumVision — Quantum Neural Network (QNN)\n4 Qubits, Dual AngleEmbedding (Z, X), RY/RZ+CNOT, 4-Wire Expectation", fontsize=11, pad=12)
        
        png_out_path = DOCS_FIG_DIR / "qnn_circuit.png"
        fig.savefig(png_out_path, dpi=300, bbox_inches="tight")

        # Mirror to artifacts directory
        artifact_png = ARTIFACTS_FIG_DIR / "qnn_circuit.png"
        fig.savefig(artifact_png, dpi=300, bbox_inches="tight")
        plt.close(fig)

        print(f"[OK] High-resolution PNG saved to: {png_out_path}")
        print(f"[OK] Mirrored to: {artifact_png}")
        return True

    except Exception as e:
        print(f"[ERROR] Failed to render QNN circuit: {e}", file=sys.stderr)
        return False


def main():
    print("=" * 76)
    print("  QUANTUMVISION — PENNYLANE QUANTUM CIRCUIT VISUALIZATION ENGINE")
    print("=" * 76)

    success_vqc = visualize_vqc()
    success_qnn = visualize_qnn()

    print("\n" + "=" * 76)
    if success_vqc and success_qnn:
        print("  ALL QUANTUM CIRCUITS SUCCESSFULLY VISUALIZED AND SAVED.")
        print("=" * 76)
        sys.exit(0)
    else:
        print("  QUANTUM CIRCUIT VISUALIZATION COMPLETED WITH ERRORS.", file=sys.stderr)
        print("=" * 76, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
