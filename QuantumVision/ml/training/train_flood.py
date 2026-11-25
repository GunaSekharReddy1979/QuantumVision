"""
QuantumVision Machine Learning Pipeline (Phase 3):
Retrains all four existing flood classification models using the verified expanded dataset (5,000 samples).
1. Random Forest (RF) - Hyperparameter tuned on validation split
2. XGBoost - Hyperparameter tuned with class weight balancing
3. Variational Quantum Classifier (VQC) - PennyLane differentiable circuit optimization
4. Quantum Neural Network (QNN) - PennyLane dual-basis variational circuit optimization

Evaluates all four models on the identical held-out test partition (N=982 samples, zero spatial leakage).
"""
import sys
import os
import shutil
import json
import tempfile
from pathlib import Path
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
from xgboost import XGBClassifier

# Silence Matplotlib cache warning on Windows
os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()
import pennylane as qml

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.preprocessing.split import get_or_create_split_indices, audit_dataset_leakage
from ml.evaluation.metrics import compute_classification_metrics

FEATURES_CSV = PROJECT_ROOT / "data" / "features" / "flood_training_samples.csv"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
ARTIFACTS_CLASSICAL = PROJECT_ROOT / "ml" / "artifacts" / "classical"
ARTIFACTS_QUANTUM = PROJECT_ROOT / "ml" / "artifacts" / "quantum"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
ARTIFACTS_CLASSICAL.mkdir(parents=True, exist_ok=True)
ARTIFACTS_QUANTUM.mkdir(parents=True, exist_ok=True)

FEATURE_COLS = [
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

# 4 Key features for 4-qubit quantum circuit encoding
QUANTUM_FEATURE_COLS = [
    "sar_vv_db",
    "sar_temporal_diff_db",
    "elevation_m",
    "rainfall_accum_24h_mm"
]

def train_and_evaluate():
    print("=" * 80)
    print(" QUANTUMVISION PHASE 3: FOUR-MODEL RETRAINING & BENCHMARKING PIPELINE")
    print(" Target: Srikakulam Flood Detection & Hazard Classification (5,000 Samples)")
    print("=" * 80)

    # -------------------------------------------------------------
    # 1. PRE-TRAINING VERIFICATION
    # -------------------------------------------------------------
    if not FEATURES_CSV.exists():
        raise FileNotFoundError(f"Feature dataset {FEATURES_CSV} not found.")

    df = pd.read_csv(FEATURES_CSV)
    print(f"\n[Verification] Loaded {len(df)} samples from {FEATURES_CSV.name}")
    print(f"[Verification] Features: {len(FEATURE_COLS)} continuous attributes")
    print(f"[Verification] Class distribution: Non-flood = {int(np.sum(df['flood_label'] == 0))} ({np.mean(df['flood_label'] == 0)*100:.2f}%), Flood = {int(np.sum(df['flood_label'] == 1))} ({np.mean(df['flood_label'] == 1)*100:.2f}%)")

    X = df[FEATURE_COLS].values
    y = df["flood_label"].values.astype(int)

    # Load persisted spatial block split indices (4,018 train / 982 test)
    train_idx, test_idx, split_meta = get_or_create_split_indices(
        df, test_size=0.20, random_state=42, stratify_col="flood_label"
    )
    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    print(f"[Verification] Train partition: {len(X_train)} samples ({int(np.sum(y_train == 1))} flood, {int(np.sum(y_train == 0))} non-flood)")
    print(f"[Verification] Test partition : {len(X_test)} samples ({int(np.sum(y_test == 1))} flood, {int(np.sum(y_test == 0))} non-flood) [Held-out]")

    # Leakage check
    leakage_audit = audit_dataset_leakage(df, train_idx, test_idx, FEATURE_COLS, "flood_label")
    print(f"[Verification] Spatial leakage check: {leakage_audit['spatial_leakage_note']}")
    assert leakage_audit['spatial_cross_split_leakage_locations'] == 0, "Cross-split spatial leakage detected!"

    # Classical Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    training_logs = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": "flood_training_samples.csv (5,000 samples)",
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "models": {}
    }

    # -------------------------------------------------------------
    # 2. CLASSICAL MODEL 1: RANDOM FOREST WITH VALIDATION TUNING
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print(" [1/4] TUNING & TRAINING RANDOM FOREST CLASSIFIER")
    print("-" * 75)

    rf_param_grid = [
        {"n_estimators": 100, "max_depth": 8, "min_samples_split": 4, "class_weight": "balanced"},
        {"n_estimators": 150, "max_depth": 10, "min_samples_split": 4, "class_weight": "balanced"},
        {"n_estimators": 200, "max_depth": 12, "min_samples_split": 2, "class_weight": "balanced"},
        {"n_estimators": 100, "max_depth": 10, "min_samples_split": 2, "class_weight": None},
    ]

    skf = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)
    best_rf_f1 = -1.0
    best_rf_params = rf_param_grid[0]

    print("  • Evaluating RF candidate hyperparameter configurations on training folds:")
    for i, params in enumerate(rf_param_grid):
        fold_scores = []
        for tr_fold, val_fold in skf.split(X_train_scaled, y_train):
            clf = RandomForestClassifier(**params, random_state=42, n_jobs=-1)
            clf.fit(X_train_scaled[tr_fold], y_train[tr_fold])
            val_preds = clf.predict(X_train_scaled[val_fold])
            val_f1 = compute_classification_metrics(y_train[val_fold], val_preds)["flood_f1"]
            fold_scores.append(val_f1)
        mean_f1 = float(np.mean(fold_scores))
        print(f"    Config {i+1}: {params} -> Mean Val Flood-F1: {mean_f1:.4f}")
        if mean_f1 > best_rf_f1:
            best_rf_f1 = mean_f1
            best_rf_params = params

    print(f"  • Selected Optimal RF Parameters: {best_rf_params} (Val Flood-F1: {best_rf_f1:.4f})")
    rf_model = RandomForestClassifier(**best_rf_params, random_state=42, n_jobs=-1)
    rf_model.fit(X_train_scaled, y_train)

    rf_preds = rf_model.predict(X_test_scaled)
    rf_probs = rf_model.predict_proba(X_test_scaled)[:, 1]
    rf_metrics = compute_classification_metrics(y_test, rf_preds, rf_probs, "Random Forest", "Classical ML")
    rf_metrics["selected_hyperparameters"] = best_rf_params
    rf_metrics["validation_flood_f1"] = round(best_rf_f1, 4)
    rf_metrics["status"] = "VALIDATED"

    print(f"  -> RF Test Results (N={len(y_test)}):")
    print(f"     Accuracy: {rf_metrics['accuracy']:.4f} | Flood F1: {rf_metrics['flood_f1']:.4f} | Flood Recall: {rf_metrics['flood_recall']:.4f} | ROC-AUC: {rf_metrics['roc_auc']:.4f}")
    print(f"     Confusion Matrix [TN, FP, FN, TP]: {rf_metrics['confusion_matrix']}")

    training_logs["models"]["random_forest"] = {
        "best_hyperparameters": best_rf_params,
        "validation_score": best_rf_f1,
        "test_metrics": rf_metrics
    }

    # -------------------------------------------------------------
    # 3. CLASSICAL MODEL 2: XGBOOST WITH VALIDATION TUNING
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print(" [2/4] TUNING & TRAINING XGBOOST CLASSIFIER")
    print("-" * 75)

    pos_count = int(np.sum(y_train == 1))
    neg_count = int(np.sum(y_train == 0))
    scale_pos = round(neg_count / pos_count, 2)

    xgb_param_grid = [
        {"n_estimators": 100, "max_depth": 5, "learning_rate": 0.08, "scale_pos_weight": scale_pos, "subsample": 0.85, "colsample_bytree": 0.85},
        {"n_estimators": 150, "max_depth": 6, "learning_rate": 0.05, "scale_pos_weight": scale_pos, "subsample": 0.85, "colsample_bytree": 0.85},
        {"n_estimators": 120, "max_depth": 4, "learning_rate": 0.10, "scale_pos_weight": 1.0, "subsample": 0.90, "colsample_bytree": 0.90},
        {"n_estimators": 150, "max_depth": 5, "learning_rate": 0.08, "scale_pos_weight": scale_pos, "subsample": 0.80, "colsample_bytree": 0.80},
    ]

    best_xgb_f1 = -1.0
    best_xgb_params = xgb_param_grid[0]

    print(f"  • Evaluating XGB candidate hyperparameter configurations (scale_pos_weight={scale_pos}):")
    for i, params in enumerate(xgb_param_grid):
        fold_scores = []
        for tr_fold, val_fold in skf.split(X_train_scaled, y_train):
            clf = XGBClassifier(**params, random_state=42, eval_metric="logloss", n_jobs=-1)
            clf.fit(X_train_scaled[tr_fold], y_train[tr_fold])
            val_preds = clf.predict(X_train_scaled[val_fold])
            val_f1 = compute_classification_metrics(y_train[val_fold], val_preds)["flood_f1"]
            fold_scores.append(val_f1)
        mean_f1 = float(np.mean(fold_scores))
        print(f"    Config {i+1}: {params} -> Mean Val Flood-F1: {mean_f1:.4f}")
        if mean_f1 > best_xgb_f1:
            best_xgb_f1 = mean_f1
            best_xgb_params = params

    print(f"  • Selected Optimal XGB Parameters: {best_xgb_params} (Val Flood-F1: {best_xgb_f1:.4f})")
    xgb_model = XGBClassifier(**best_xgb_params, random_state=42, eval_metric="logloss", n_jobs=-1)
    xgb_model.fit(X_train_scaled, y_train)

    xgb_preds = xgb_model.predict(X_test_scaled)
    xgb_probs = xgb_model.predict_proba(X_test_scaled)[:, 1]
    xgb_metrics = compute_classification_metrics(y_test, xgb_preds, xgb_probs, "XGBoost", "Classical ML")
    xgb_metrics["selected_hyperparameters"] = best_xgb_params
    xgb_metrics["validation_flood_f1"] = round(best_xgb_f1, 4)
    xgb_metrics["status"] = "VALIDATED"

    print(f"  -> XGB Test Results (N={len(y_test)}):")
    print(f"     Accuracy: {xgb_metrics['accuracy']:.4f} | Flood F1: {xgb_metrics['flood_f1']:.4f} | Flood Recall: {xgb_metrics['flood_recall']:.4f} | ROC-AUC: {xgb_metrics['roc_auc']:.4f}")
    print(f"     Confusion Matrix [TN, FP, FN, TP]: {xgb_metrics['confusion_matrix']}")

    training_logs["models"]["xgboost"] = {
        "best_hyperparameters": best_xgb_params,
        "validation_score": best_xgb_f1,
        "test_metrics": xgb_metrics
    }

    # -------------------------------------------------------------
    # 4. PREPARE QUANTUM DATA (4 WIRES)
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print(" [3/4] PREPARING QUANTUM FEATURE SCALING & VARIATIONAL CIRCUITS")
    print("-" * 75)

    q_indices = [FEATURE_COLS.index(col) for col in QUANTUM_FEATURE_COLS]
    X_train_q_raw = X_train[:, q_indices]
    X_test_q_raw = X_test[:, q_indices]

    q_scaler = MinMaxScaler(feature_range=(-np.pi, np.pi))
    X_train_q = q_scaler.fit_transform(X_train_q_raw)
    X_test_q = q_scaler.transform(X_test_q_raw)

    n_qubits = 4
    n_layers = 2
    dev = qml.device("default.qubit", wires=n_qubits)

    # Balanced quantum training subset for differentiable autograd optimization
    np.random.seed(42)
    pos_idx = np.where(y_train == 1)[0]
    neg_idx = np.where(y_train == 0)[0]
    n_pos = min(80, len(pos_idx))
    n_neg = 80
    sub_pos = np.random.choice(pos_idx, size=n_pos, replace=False)
    sub_neg = np.random.choice(neg_idx, size=n_neg, replace=False)
    q_train_sub_idx = np.concatenate([sub_pos, sub_neg])
    np.random.shuffle(q_train_sub_idx)

    X_train_q_sub = X_train_q[q_train_sub_idx]
    y_train_sub = y_train[q_train_sub_idx]
    y_train_q_sub = np.where(y_train_sub == 0, -1, 1)

    print(f"  • Quantum device: PennyLane default.qubit (4 qubits, statevector simulation)")
    print(f"  • Quantum features: {QUANTUM_FEATURE_COLS}")
    print(f"  • Variational training batch: {len(X_train_q_sub)} balanced samples ({n_pos} flood, {n_neg} non-flood)")

    # -------------------------------------------------------------
    # 5. QUANTUM MODEL 1: VARIATIONAL QUANTUM CLASSIFIER (VQC)
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print(" [3/4] TRAINING VARIATIONAL QUANTUM CLASSIFIER (VQC)")
    print("-" * 75)

    @qml.qnode(dev, interface="autograd")
    def vqc_circuit(weights, x):
        qml.AngleEmbedding(x, wires=range(n_qubits), rotation="Y")
        for l in range(n_layers):
            for i in range(n_qubits):
                qml.Rot(weights[l, i, 0], weights[l, i, 1], weights[l, i, 2], wires=i)
            for i in range(n_qubits):
                qml.CNOT(wires=[i, (i + 1) % n_qubits])
        return qml.expval(qml.PauliZ(0))

    def vqc_cost(weights, X_b, y_b):
        preds = qml.numpy.stack([vqc_circuit(weights, x) for x in X_b])
        return qml.numpy.mean((preds - y_b) ** 2)

    np.random.seed(42)
    vqc_weights = qml.numpy.array(np.random.uniform(-0.1, 0.1, size=(n_layers, n_qubits, 3)), requires_grad=True)
    vqc_opt = qml.AdamOptimizer(stepsize=0.10)
    vqc_epochs = 25
    vqc_history = []

    print(f"  • Optimizing {n_layers * n_qubits * 3} trainable VQC variational parameters over {vqc_epochs} steps:")
    for step in range(vqc_epochs):
        vqc_weights, cost_val = vqc_opt.step_and_cost(lambda w: vqc_cost(w, X_train_q_sub, y_train_q_sub), vqc_weights)
        cost_float = float(cost_val)
        vqc_history.append({"step": step + 1, "quantum_loss": round(cost_float, 4)})
        if (step + 1) % 5 == 0 or step == 0:
            print(f"    Step {step + 1:02d}/{vqc_epochs} - VQC Quantum MSE Loss: {cost_float:.4f}")

    print(f"  • Evaluating VQC circuit across all {len(X_test_q)} test samples...")
    vqc_raw_preds = np.array([float(vqc_circuit(vqc_weights, x)) for x in X_test_q])
    vqc_probs = np.clip((vqc_raw_preds + 1.0) / 2.0, 0.0, 1.0)
    vqc_binary_preds = np.where(vqc_raw_preds >= 0.0, 1, 0)

    vqc_metrics = compute_classification_metrics(y_test, vqc_binary_preds, vqc_probs, "Variational Quantum Classifier (VQC)", "Quantum Simulator")
    vqc_metrics["simulator"] = "PennyLane default.qubit"
    vqc_metrics["num_qubits"] = n_qubits
    vqc_metrics["circuit_depth"] = n_layers
    vqc_metrics["parameters_count"] = int(n_layers * n_qubits * 3)
    vqc_metrics["status"] = "SIMULATION"
    vqc_metrics["disclaimer"] = "Simulated quantum circuit evaluated on identical full test split. No physical quantum supremacy is claimed over classical models."

    print(f"  -> VQC Test Results (N={len(y_test)}):")
    print(f"     Accuracy: {vqc_metrics['accuracy']:.4f} | Flood F1: {vqc_metrics['flood_f1']:.4f} | Flood Recall: {vqc_metrics['flood_recall']:.4f} | ROC-AUC: {vqc_metrics['roc_auc']:.4f}")
    print(f"     Confusion Matrix [TN, FP, FN, TP]: {vqc_metrics['confusion_matrix']}")

    training_logs["models"]["vqc_quantum"] = {
        "num_qubits": n_qubits,
        "circuit_layers": n_layers,
        "trainable_params": n_layers * n_qubits * 3,
        "optimizer": "Adam (stepsize=0.10)",
        "epochs": vqc_epochs,
        "loss_history": vqc_history,
        "test_metrics": vqc_metrics
    }

    # -------------------------------------------------------------
    # 6. QUANTUM MODEL 2: QUANTUM NEURAL NETWORK (QNN)
    # -------------------------------------------------------------
    print("\n" + "-" * 75)
    print(" [4/4] TRAINING QUANTUM NEURAL NETWORK (QNN)")
    print("-" * 75)

    @qml.qnode(dev, interface="autograd")
    def qnn_circuit(weights, x):
        qml.AngleEmbedding(x, wires=range(n_qubits), rotation="Z")
        qml.AngleEmbedding(x, wires=range(n_qubits), rotation="X")
        for l in range(n_layers):
            for i in range(n_qubits):
                qml.RY(weights[l, i, 0], wires=i)
                qml.RZ(weights[l, i, 1], wires=i)
            for i in range(n_qubits):
                qml.CNOT(wires=[i, (i + 1) % n_qubits])
        return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

    def qnn_cost(weights, X_b, y_b):
        losses = []
        for x, y_true in zip(X_b, y_b):
            outs = qnn_circuit(weights, x)
            val = qml.numpy.mean(qml.numpy.stack(outs))
            prob = 1.0 / (1.0 + qml.numpy.exp(-2.5 * val))
            losses.append((prob - y_true) ** 2)
        return qml.numpy.mean(qml.numpy.stack(losses))

    np.random.seed(42)
    qnn_weights = qml.numpy.array(np.random.uniform(-0.1, 0.1, size=(n_layers, n_qubits, 2)), requires_grad=True)
    qnn_opt = qml.AdamOptimizer(stepsize=0.08)
    qnn_epochs = 25
    qnn_history = []

    print(f"  • Optimizing {n_layers * n_qubits * 2} trainable QNN variational parameters over {qnn_epochs} steps:")
    for step in range(qnn_epochs):
        qnn_weights, cost_val = qnn_opt.step_and_cost(lambda w: qnn_cost(w, X_train_q_sub, y_train_sub), qnn_weights)
        cost_float = float(cost_val)
        qnn_history.append({"step": step + 1, "quantum_loss": round(cost_float, 4)})
        if (step + 1) % 5 == 0 or step == 0:
            print(f"    Step {step + 1:02d}/{qnn_epochs} - QNN Quantum MSE Loss: {cost_float:.4f}")

    print(f"  • Evaluating QNN circuit across all {len(X_test_q)} test samples...")
    qnn_probs = []
    for x in X_test_q:
        outs = qnn_circuit(qnn_weights, x)
        val = float(np.mean(outs))
        prob = float(np.clip(1.0 / (1.0 + np.exp(-2.5 * val)), 0.0, 1.0))
        qnn_probs.append(prob)
    qnn_probs = np.array(qnn_probs)
    qnn_binary_preds = np.where(qnn_probs >= 0.5, 1, 0)

    qnn_metrics = compute_classification_metrics(y_test, qnn_binary_preds, qnn_probs, "Quantum Neural Network (QNN)", "Quantum Simulator")
    qnn_metrics["simulator"] = "PennyLane default.qubit"
    qnn_metrics["num_qubits"] = n_qubits
    qnn_metrics["circuit_depth"] = n_layers
    qnn_metrics["parameters_count"] = int(n_layers * n_qubits * 2)
    qnn_metrics["status"] = "SIMULATION"
    qnn_metrics["disclaimer"] = "Simulated quantum neural network layer evaluated on identical full test split."

    print(f"  -> QNN Test Results (N={len(y_test)}):")
    print(f"     Accuracy: {qnn_metrics['accuracy']:.4f} | Flood F1: {qnn_metrics['flood_f1']:.4f} | Flood Recall: {qnn_metrics['flood_recall']:.4f} | ROC-AUC: {qnn_metrics['roc_auc']:.4f}")
    print(f"     Confusion Matrix [TN, FP, FN, TP]: {qnn_metrics['confusion_matrix']}")

    training_logs["models"]["qnn_quantum"] = {
        "num_qubits": n_qubits,
        "circuit_layers": n_layers,
        "trainable_params": n_layers * n_qubits * 2,
        "optimizer": "Adam (stepsize=0.08)",
        "epochs": qnn_epochs,
        "loss_history": qnn_history,
        "test_metrics": qnn_metrics
    }

    # -------------------------------------------------------------
    # 7. FEATURE IMPORTANCES & METADATA
    # -------------------------------------------------------------
    rf_imp = rf_model.feature_importances_
    xgb_imp = xgb_model.feature_importances_
    importance_data = {
        "features": FEATURE_COLS,
        "random_forest_importance": [round(float(v), 4) for v in rf_imp],
        "xgboost_importance": [round(float(v), 4) for v in xgb_imp],
        "top_contributing_feature": FEATURE_COLS[int(np.argmax(rf_imp))]
    }

    model_metadata = {
        "dataset_version": "v2.0-5000-samples-expanded",
        "total_samples": len(df),
        "split_strategy": "Spatial Block Grouped Split (5.5 km blocks, random_state=42)",
        "train_sample_count": len(X_train),
        "test_sample_count": len(X_test),
        "feature_names": FEATURE_COLS,
        "quantum_feature_names": QUANTUM_FEATURE_COLS,
        "random_seed": 42,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "model_version": "v2.0-four-models-retrained",
        "leakage_audit": leakage_audit
    }

    all_metrics = {
        "task": "Flood Risk Prediction (Binary Classification)",
        "study_area": "Srikakulam District, Andhra Pradesh, India",
        "dataset_version": "v2.0-5000-samples-expanded",
        "test_sample_count": len(y_test),
        "models": {
            "random_forest": rf_metrics,
            "xgboost": xgb_metrics,
            "vqc_quantum": vqc_metrics,
            "qnn_quantum": qnn_metrics
        },
        "feature_names": FEATURE_COLS,
        "quantum_feature_names": QUANTUM_FEATURE_COLS,
        "metadata": model_metadata
    }

    # -------------------------------------------------------------
    # 8. SAVE ARTIFACTS IN MODELS_DIR & ARTIFACTS_DIR
    # -------------------------------------------------------------
    print("\n" + "=" * 75)
    print(" SAVING RETRAINED ARTIFACTS & EVALUATION REPORTS")
    print("=" * 75)

    # Primary: ml/models/
    joblib.dump(scaler, MODELS_DIR / "scaler.joblib")
    joblib.dump(rf_model, MODELS_DIR / "rf_flood_model.joblib")
    xgb_model.save_model(str(MODELS_DIR / "xgb_flood_model.json"))
    joblib.dump(q_scaler, MODELS_DIR / "quantum_scaler.joblib")
    np.save(MODELS_DIR / "vqc_weights.npy", np.array(vqc_weights))
    np.save(MODELS_DIR / "qnn_weights.npy", np.array(qnn_weights))
    with open(MODELS_DIR / "feature_importance.json", "w") as f:
        json.dump(importance_data, f, indent=2)
    with open(MODELS_DIR / "evaluation_metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=2)
    with open(MODELS_DIR / "model_metadata.json", "w") as f:
        json.dump(model_metadata, f, indent=2)
    with open(MODELS_DIR / "training_logs.json", "w") as f:
        json.dump(training_logs, f, indent=2)

    # Mirror: ml/artifacts/
    joblib.dump(scaler, ARTIFACTS_CLASSICAL / "scaler.joblib")
    joblib.dump(rf_model, ARTIFACTS_CLASSICAL / "rf_flood_model.joblib")
    xgb_model.save_model(str(ARTIFACTS_CLASSICAL / "xgb_flood_model.json"))
    joblib.dump(q_scaler, ARTIFACTS_QUANTUM / "quantum_scaler.joblib")
    np.save(ARTIFACTS_QUANTUM / "vqc_weights.npy", np.array(vqc_weights))
    np.save(ARTIFACTS_QUANTUM / "qnn_weights.npy", np.array(qnn_weights))
    with open(ARTIFACTS_QUANTUM / "feature_importance.json", "w") as f:
        json.dump(importance_data, f, indent=2)
    with open(ARTIFACTS_QUANTUM / "evaluation_metrics.json", "w") as f:
        json.dump(all_metrics, f, indent=2)
    with open(ARTIFACTS_QUANTUM / "model_metadata.json", "w") as f:
        json.dump(model_metadata, f, indent=2)
    with open(ARTIFACTS_QUANTUM / "training_logs.json", "w") as f:
        json.dump(training_logs, f, indent=2)

    print("\n" + "=" * 80)
    print(f" FOUR-MODEL EVALUATION ON IDENTICAL HELD-OUT TEST PARTITION (N={len(y_test)}):")
    print("-" * 80)
    print(f"{'Model':<35} | {'Acc':<7} | {'Flood-F1':<9} | {'Flood-Rec':<10} | {'Macro-F1':<9} | {'ROC-AUC':<8}")
    print("-" * 80)
    for k, m in all_metrics["models"].items():
        auc_str = f"{m['roc_auc']:.4f}" if m['roc_auc'] is not None else "N/A"
        print(f"{m['model']:<35} | {m['accuracy']:<7.4f} | {m['flood_f1']:<9.4f} | {m['flood_recall']:<10.4f} | {m['macro_f1']:<9.4f} | {auc_str:<8}")
    print("=" * 80)

    return all_metrics

if __name__ == "__main__":
    train_and_evaluate()
