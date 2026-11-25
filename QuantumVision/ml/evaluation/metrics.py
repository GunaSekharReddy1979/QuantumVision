"""
QuantumVision ML Evaluation Metrics Module:
Computes and formats classification metrics for Classical and Quantum ML models.
Includes accuracy, flood precision, flood recall, flood F1, macro F1, ROC-AUC,
confusion matrices, and class support counts.
"""
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

def compute_classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None,
    model_name: str = "Model",
    model_type: str = "Classical ML"
) -> Dict[str, Any]:
    """Computes comprehensive classification metrics with full support counts."""
    y_true_arr = np.asarray(y_true, dtype=int)
    y_pred_arr = np.asarray(y_pred, dtype=int)

    acc = float(accuracy_score(y_true_arr, y_pred_arr))
    flood_prec = float(precision_score(y_true_arr, y_pred_arr, pos_label=1, zero_division=0))
    flood_rec = float(recall_score(y_true_arr, y_pred_arr, pos_label=1, zero_division=0))
    flood_f1 = float(f1_score(y_true_arr, y_pred_arr, pos_label=1, zero_division=0))

    non_flood_prec = float(precision_score(y_true_arr, y_pred_arr, pos_label=0, zero_division=0))
    non_flood_rec = float(recall_score(y_true_arr, y_pred_arr, pos_label=0, zero_division=0))
    non_flood_f1 = float(f1_score(y_true_arr, y_pred_arr, pos_label=0, zero_division=0))

    macro_prec = float(precision_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
    macro_rec = float(recall_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
    macro_f1 = float(f1_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
    cm = confusion_matrix(y_true_arr, y_pred_arr).tolist()

    non_flood_support = int(np.sum(y_true_arr == 0))
    flood_support = int(np.sum(y_true_arr == 1))

    metrics = {
        "model": model_name,
        "type": model_type,
        "accuracy": round(acc, 4),
        "flood_precision": round(flood_prec, 4),
        "flood_recall": round(flood_rec, 4),
        "flood_f1": round(flood_f1, 4),
        "non_flood_precision": round(non_flood_prec, 4),
        "non_flood_recall": round(non_flood_rec, 4),
        "non_flood_f1": round(non_flood_f1, 4),
        "macro_precision": round(macro_prec, 4),
        "macro_recall": round(macro_rec, 4),
        "macro_f1": round(macro_f1, 4),
        # Aliases for backwards compatibility with existing UI components
        "precision": round(flood_prec, 4),
        "recall": round(flood_rec, 4),
        "f1_score": round(flood_f1, 4),
        "confusion_matrix": cm,
        "support": {
            "non_flood": non_flood_support,
            "flood": flood_support,
            "total": len(y_true_arr)
        },
        "test_sample_count": len(y_true_arr)
    }

    if y_prob is not None:
        try:
            metrics["roc_auc"] = round(float(roc_auc_score(y_true_arr, y_prob)), 4)
        except Exception:
            metrics["roc_auc"] = None
    else:
        metrics["roc_auc"] = None

    return metrics
