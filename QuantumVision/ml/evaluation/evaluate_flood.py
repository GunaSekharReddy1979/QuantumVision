"""
QuantumVision Flood Models Evaluation Script:
Evaluates Random Forest, XGBoost, VQC, and QNN across the COMPLETE identical held-out test set.
Computes accuracy, flood precision, flood recall, flood F1, macro F1, ROC-AUC, confusion matrices, and support counts.
"""
import sys
from pathlib import Path
import json
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.inference.model_loader import registry, FEATURE_NAMES, QUANTUM_FEATURE_NAMES
from ml.preprocessing.split import get_or_create_split_indices
from ml.evaluation.metrics import compute_classification_metrics

FEATURES_CSV = PROJECT_ROOT / "data" / "features" / "flood_training_samples.csv"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
ARTIFACTS_QUANTUM = PROJECT_ROOT / "ml" / "artifacts" / "quantum"

def evaluate_models():
    print("=" * 75)
    print(" QUANTUMVISION FULL HELD-OUT TEST SET EVALUATION & BENCHMARK")
    print("=" * 75)

    if not FEATURES_CSV.exists():
        print(f"Features dataset not found at {FEATURES_CSV}")
        return {}

    df = pd.read_csv(FEATURES_CSV)
    X = df[FEATURE_NAMES].values
    y = df["flood_label"].values

    # 1. Use the exact single reproducible stratified split
    train_idx, test_idx, split_meta = get_or_create_split_indices(
        df, test_size=0.20, random_state=42, stratify_col="flood_label"
    )
    X_test, y_test = X[test_idx], y[test_idx]

    print(f"Evaluating all models on complete held-out test split: {len(X_test)} samples...")
    print(f"Class support: Non-flood = {int(np.sum(y_test == 0))}, Flood = {int(np.sum(y_test == 1))}")

    # Ensure model registry loads latest weights
    registry.load_all()

    results = {}

    # 1. Random Forest (Independent)
    if registry.rf_model and registry.scaler:
        X_scaled = registry.scaler.transform(X_test)
        rf_preds = registry.rf_model.predict(X_scaled)
        rf_probs = registry.rf_model.predict_proba(X_scaled)[:, 1]
        rf_m = compute_classification_metrics(y_test, rf_preds, rf_probs, "Random Forest", "Classical ML")
        rf_m["status"] = "VALIDATED"
        results["random_forest"] = rf_m

    # 2. XGBoost (Independent)
    if registry.xgb_model and registry.scaler:
        X_scaled = registry.scaler.transform(X_test)
        xgb_preds = registry.xgb_model.predict(X_scaled)
        xgb_probs = registry.xgb_model.predict_proba(X_scaled)[:, 1]
        xgb_m = compute_classification_metrics(y_test, xgb_preds, xgb_probs, "XGBoost", "Classical ML")
        xgb_m["status"] = "VALIDATED"
        results["xgboost"] = xgb_m

    # 3. Variational Quantum Classifier (VQC - Full Test Set)
    if registry.vqc_weights is not None and registry.quantum_scaler and registry.vqc_circuit_fn:
        q_cols = [FEATURE_NAMES.index(c) for c in QUANTUM_FEATURE_NAMES]
        X_q = registry.quantum_scaler.transform(X_test[:, q_cols])
        print("  -> Evaluating VQC circuit on all test samples...")
        raw_vqc = np.array([float(registry.vqc_circuit_fn(registry.vqc_weights, x)) for x in X_q])
        vqc_probs = np.clip((raw_vqc + 1.0) / 2.0, 0.0, 1.0)
        vqc_preds = np.where(raw_vqc >= 0.0, 1, 0)
        vqc_m = compute_classification_metrics(y_test, vqc_preds, vqc_probs, "Variational Quantum Classifier (VQC)", "Quantum Simulator")
        vqc_m["simulator"] = "PennyLane default.qubit"
        vqc_m["status"] = "SIMULATION"
        vqc_m["disclaimer"] = "Simulated quantum circuit evaluated on identical full test split."
        results["vqc_quantum"] = vqc_m

    # 4. Quantum Neural Network (QNN - Full Test Set)
    if registry.qnn_weights is not None and registry.quantum_scaler and registry.qnn_circuit_fn:
        q_cols = [FEATURE_NAMES.index(c) for c in QUANTUM_FEATURE_NAMES]
        X_q = registry.quantum_scaler.transform(X_test[:, q_cols])
        print("  -> Evaluating QNN circuit on all test samples...")
        qnn_probs = []
        for x in X_q:
            outs = registry.qnn_circuit_fn(registry.qnn_weights, x)
            val = float(np.mean(outs))
            prob = float(np.clip(1.0 / (1.0 + np.exp(-2.5 * val)), 0.0, 1.0))
            qnn_probs.append(prob)
        qnn_probs = np.array(qnn_probs)
        qnn_preds = np.where(qnn_probs >= 0.5, 1, 0)
        qnn_m = compute_classification_metrics(y_test, qnn_preds, qnn_probs, "Quantum Neural Network (QNN)", "Quantum Simulator")
        qnn_m["simulator"] = "PennyLane default.qubit"
        qnn_m["status"] = "SIMULATION"
        qnn_m["disclaimer"] = "Simulated quantum neural network layer evaluated on identical full test split."
        results["qnn_quantum"] = qnn_m

    all_evaluation = {
        "task": "Flood Risk Prediction (Binary Classification)",
        "study_area": "Srikakulam District, Andhra Pradesh, India",
        "dataset_version": "v1.0-1500-samples",
        "test_sample_count": len(y_test),
        "models": results,
        "feature_names": FEATURE_NAMES,
        "quantum_feature_names": QUANTUM_FEATURE_NAMES
    }

    # Save to both locations
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACTS_QUANTUM.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / "evaluation_metrics.json", "w", encoding="utf-8") as f:
        json.dump(all_evaluation, f, indent=2)
    with open(ARTIFACTS_QUANTUM / "evaluation_metrics.json", "w", encoding="utf-8") as f:
        json.dump(all_evaluation, f, indent=2)

    print("\n" + "=" * 75)
    print(" COMPREHENSIVE BENCHMARK EVALUATION (COMPLETE TEST SET N=300):")
    print("-" * 75)
    print(f" {'Model':<36} | {'Accuracy':<8} | {'Flood F1':<8} | {'Macro F1':<8} | {'ROC-AUC':<8}")
    print("-" * 75)
    for model_key, m in results.items():
        roc_str = f"{m['roc_auc']:.4f}" if m.get("roc_auc") is not None else "N/A"
        print(f" {m['model']:<36} | {m['accuracy']:<8.4f} | {m['flood_f1']:<8.4f} | {m['macro_f1']:<8.4f} | {roc_str:<8}")
    print("=" * 75)
    return results

if __name__ == "__main__":
    evaluate_models()
