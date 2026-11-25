"""
Phase 4: Comparative Statistical Analysis and Visualizations Generation.
Generates all 7 required publication figures and statistical bootstrap intervals:
1. Baseline vs New Accuracy
2. Precision Comparison
3. Recall Comparison
4. F1-Score Comparison
5. Four Confusion Matrices (Heatmaps)
6. Training & Inference Time Comparison
7. Dataset Size & Sample Composition Comparison
"""
import os
import json
import tempfile
from pathlib import Path
import numpy as np
import pandas as pd

# Set Matplotlib cache dir for Windows sandbox
os.environ["MPLCONFIGDIR"] = tempfile.gettempdir()
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, f1_score, recall_score, precision_score, accuracy_score

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FIGURES_DIR = PROJECT_ROOT / "ml" / "artifacts" / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

# Also copy to artifacts directory for conversation viewing
CONV_ARTIFACTS_DIR = Path(r"C:\Users\nanir\.gemini\antigravity\brain\8098ba01-1661-45d2-845e-819e8c9dacb3")

# Set publication style
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["DejaVu Sans", "Arial", "Helvetica"],
    "font.size": 10,
    "axes.titlesize": 12,
    "axes.labelsize": 11,
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "legend.fontsize": 10,
    "figure.titlesize": 13,
})

MODELS = ["Random Forest", "XGBoost", "VQC (Quantum)", "QNN (Quantum)"]

# Baseline metrics (1,500 samples total, 300 test)
BASELINE_METRICS = {
    "Accuracy": [0.9967, 0.9967, 0.9167, 0.5633],
    "Precision": [1.0000, 1.0000, 0.6275, 0.1921],
    "Recall": [0.9737, 0.9737, 0.8421, 0.7632],
    "F1": [0.9867, 0.9867, 0.7191, 0.3069],
    "Training_Time_s": [1.8, 1.2, 42.0, 38.0],
    "Inference_Time_ms": [0.08, 0.05, 6.8, 6.5],
}

# New Retrained Phase 3 metrics (5,000 samples total, 982 test)
NEW_METRICS = {
    "Accuracy": [0.9980, 0.9980, 0.8961, 0.9012],
    "Precision": [1.0000, 1.0000, 0.6230, 0.6484],
    "Recall": [0.9877, 0.9877, 0.9383, 0.8765],
    "F1": [0.9938, 0.9938, 0.7488, 0.7454],
    "Training_Time_s": [2.6, 1.9, 32.5, 29.8],
    "Inference_Time_ms": [0.07, 0.04, 6.7, 6.4],
}

NEW_CMS = {
    "Random Forest": np.array([[820, 0], [2, 160]]),
    "XGBoost": np.array([[820, 0], [2, 160]]),
    "VQC (Quantum)": np.array([[728, 92], [10, 152]]),
    "QNN (Quantum)": np.array([[743, 77], [20, 142]]),
}

def save_fig(fig, filename):
    p1 = FIGURES_DIR / filename
    fig.savefig(p1, dpi=300, bbox_inches="tight")
    if CONV_ARTIFACTS_DIR.exists():
        p2 = CONV_ARTIFACTS_DIR / filename
        fig.savefig(p2, dpi=300, bbox_inches="tight")
    print(f"Saved: {p1}")
    plt.close(fig)

def generate_metric_comparison_chart(metric_name, baseline_vals, new_vals, filename, ylabel="Score"):
    fig, ax = plt.subplots(figsize=(7.5, 4.2))
    x = np.arange(len(MODELS))
    width = 0.34

    bars1 = ax.bar(x - width/2, baseline_vals, width, label="Baseline (N=1,500)", color="#93C5FD", edgecolor="#2563EB", linewidth=1.2)
    bars2 = ax.bar(x + width/2, new_vals, width, label="Retrained Phase 3 (N=5,000)", color="#1E40AF", edgecolor="#0F265C", linewidth=1.2)

    ax.set_ylabel(ylabel, fontweight="bold")
    ax.set_title(f"Model Comparison: {metric_name} (Baseline vs Phase 3)", fontweight="bold", pad=12)
    ax.set_xticks(x)
    ax.set_xticklabels(MODELS, fontweight="semibold")
    ax.set_ylim(0, 1.15)
    ax.legend(frameon=True, facecolor="white", edgecolor="#DCE6F5", loc="upper left")

    # Add delta annotations
    for b1, b2, base_v, new_v in zip(bars1, bars2, baseline_vals, new_vals):
        diff_pp = (new_v - base_v) * 100.0
        sign = "+" if diff_pp >= 0 else ""
        color = "#047857" if diff_pp >= 0 else "#B91C1C"
        # Label top of new bar
        ax.annotate(f"{new_v:.4f}\n({sign}{diff_pp:.1f} pp)",
                    xy=(b2.get_x() + b2.get_width() / 2, b2.get_height()),
                    xytext=(0, 4), textcoords="offset points",
                    ha="center", va="bottom", fontsize=8.5, fontweight="bold", color=color)
        ax.annotate(f"{base_v:.4f}",
                    xy=(b1.get_x() + b1.get_width() / 2, b1.get_height()),
                    xytext=(0, 3), textcoords="offset points",
                    ha="center", va="bottom", fontsize=8, color="#475569")

    fig.tight_layout()
    save_fig(fig, filename)

def generate_four_confusion_matrices():
    fig, axes = plt.subplots(2, 2, figsize=(10, 8.5))
    axes = axes.flatten()

    for idx, (m_name, cm) in enumerate(NEW_CMS.items()):
        ax = axes[idx]
        total = cm.sum()
        pcts = cm / total * 100.0
        labels = [
            f"True Neg (TN)\n{cm[0, 0]} ({pcts[0, 0]:.1f}%)",
            f"False Pos (FP)\n{cm[0, 1]} ({pcts[0, 1]:.1f}%)",
            f"False Neg (FN)\n{cm[1, 0]} ({pcts[1, 0]:.1f}%)",
            f"True Pos (TP)\n{cm[1, 1]} ({pcts[1, 1]:.1f}%)"
        ]
        labels_mat = np.array(labels).reshape(2, 2)

        cmap = plt.cm.Blues if "Quantum" not in m_name else plt.cm.Purples
        im = ax.imshow(cm, interpolation="nearest", cmap=cmap)

        for i in range(2):
            for j in range(2):
                text_color = "white" if cm[i, j] > total * 0.4 else "#0F265C"
                ax.text(j, i, labels_mat[i, j], ha="center", va="center",
                        color=text_color, fontsize=10, fontweight="bold")

        ax.set_title(f"{m_name} Test Matrix (N={total})", fontweight="bold", pad=8)
        ax.set_xlabel("Predicted Label (0: Safe, 1: Inundated)", fontweight="semibold")
        ax.set_ylabel("True Ground Truth Label", fontweight="semibold")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Non-Flood (0)", "Flood (1)"])
        ax.set_yticklabels(["Non-Flood (0)", "Flood (1)"], va="center")
        ax.grid(False)

    fig.suptitle("QuantumVision Phase 3: Held-Out Test Confusion Matrices (N=982)", fontsize=13, fontweight="bold", y=0.98)
    fig.tight_layout()
    save_fig(fig, "figure_5_confusion_matrices.png")

def generate_training_time_chart():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))

    x = np.arange(len(MODELS))
    # 1. Training time (seconds)
    bars1 = ax1.bar(x, NEW_METRICS["Training_Time_s"], color=["#2563EB", "#0284C7", "#7C3AED", "#9333EA"], width=0.55, edgecolor="#0F265C")
    ax1.set_ylabel("Training Wall-Clock Time (seconds)", fontweight="bold")
    ax1.set_title("Training Time Comparison", fontweight="bold")
    ax1.set_xticks(x)
    ax1.set_xticklabels(MODELS, rotation=15, ha="right", fontweight="semibold")
    ax1.set_yscale("log")
    ax1.set_ylim(0.5, 100)
    for b in bars1:
        val = b.get_height()
        ax1.annotate(f"{val:.1f}s", xy=(b.get_x() + b.get_width() / 2, val),
                     xytext=(0, 4), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")

    # 2. Inference latency per sample (ms)
    bars2 = ax2.bar(x, NEW_METRICS["Inference_Time_ms"], color=["#10B981", "#059669", "#8B5CF6", "#A855F7"], width=0.55, edgecolor="#0F265C")
    ax2.set_ylabel("Inference Latency per Sample (ms)", fontweight="bold")
    ax2.set_title("Single-Sample Inference Latency", fontweight="bold")
    ax2.set_xticks(x)
    ax2.set_xticklabels(MODELS, rotation=15, ha="right", fontweight="semibold")
    ax2.set_yscale("log")
    ax2.set_ylim(0.01, 25)
    for b in bars2:
        val = b.get_height()
        ax2.annotate(f"{val:.2f}ms", xy=(b.get_x() + b.get_width() / 2, val),
                     xytext=(0, 4), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")

    fig.suptitle("Computational Efficiency & Scalability Benchmark", fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()
    save_fig(fig, "figure_6_computational_efficiency.png")

def generate_dataset_size_chart():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))

    # Left: Total dataset sample scaling
    stages = ["Baseline (Phase 1)", "Expanded (Phase 2 & 3)"]
    totals = [1500, 5000]
    trains = [1200, 4018]
    tests = [300, 982]

    x = np.arange(len(stages))
    w = 0.35
    ax1.bar(x - w/2, trains, w, label="Training Partition", color="#3B82F6", edgecolor="#1D4ED8")
    ax1.bar(x + w/2, tests, w, label="Held-Out Test Partition", color="#F59E0B", edgecolor="#D97706")
    ax1.set_ylabel("Number of Samples", fontweight="bold")
    ax1.set_title("Dataset Partition Growth", fontweight="bold")
    ax1.set_xticks(x)
    ax1.set_xticklabels(stages, fontweight="semibold")
    ax1.set_ylim(0, 5600)
    ax1.legend(frameon=True, facecolor="white", edgecolor="#DCE6F5")

    for i in x:
        ax1.annotate(f"Train: {trains[i]:,}\n({trains[i]/totals[i]*100:.0f}%)", xy=(i - w/2, trains[i]), xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")
        ax1.annotate(f"Test: {tests[i]:,}\n({tests[i]/totals[i]*100:.0f}%)", xy=(i + w/2, tests[i]), xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")

    # Right: Class balance comparison
    categories = ["Non-Flood (0)", "Flood (1)"]
    base_counts = [1311, 189]
    new_counts = [4161, 839]

    x2 = np.arange(len(categories))
    ax2.bar(x2 - w/2, base_counts, w, label="Baseline (1,500)", color="#93C5FD", edgecolor="#2563EB")
    ax2.bar(x2 + w/2, new_counts, w, label="Phase 3 Expanded (5,000)", color="#1E40AF", edgecolor="#0F265C")
    ax2.set_ylabel("Sample Count", fontweight="bold")
    ax2.set_title("Class Representation & Balance", fontweight="bold")
    ax2.set_xticks(x2)
    ax2.set_xticklabels(categories, fontweight="semibold")
    ax2.set_ylim(0, 5000)
    ax2.legend(frameon=True, facecolor="white", edgecolor="#DCE6F5")

    for i in x2:
        ax2.annotate(f"{base_counts[i]:,}\n({base_counts[i]/1500*100:.1f}%)", xy=(i - w/2, base_counts[i]), xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5)
        ax2.annotate(f"{new_counts[i]:,}\n({new_counts[i]/5000*100:.1f}%)", xy=(i + w/2, new_counts[i]), xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=8.5, fontweight="bold")

    fig.suptitle("Dataset Expansion & Spatial Representative Scaling", fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()
    save_fig(fig, "figure_7_dataset_size_comparison.png")

def compute_bootstrap_confidence_intervals():
    """Calculates 95% bootstrap confidence intervals for all four models on test partition."""
    print("Computing 1,000-iteration bootstrap confidence intervals on N=982 test set...")
    np.random.seed(42)
    B = 1000

    # Predictions from confusion matrices:
    # y_true has 820 zeros and 162 ones
    y_true = np.array([0] * 820 + [1] * 162)

    # Reconstruct predictions:
    # RF & XGB: 820 TN (0), 0 FP (1), 2 FN (0), 160 TP (1)
    y_pred_rf = np.array([0] * 820 + [0] * 2 + [1] * 160)
    # VQC: 728 TN, 92 FP, 10 FN, 152 TP
    y_pred_vqc = np.array([0] * 728 + [1] * 92 + [0] * 10 + [1] * 152)
    # QNN: 743 TN, 77 FP, 20 FN, 142 TP
    y_pred_qnn = np.array([0] * 743 + [1] * 77 + [0] * 20 + [1] * 142)

    model_preds = {
        "Random Forest": y_pred_rf,
        "XGBoost": y_pred_rf,
        "VQC": y_pred_vqc,
        "QNN": y_pred_qnn
    }

    N = len(y_true)
    ci_results = {}

    for name, pred in model_preds.items():
        boot_acc = []
        boot_f1 = []
        boot_rec = []
        boot_prec = []

        for _ in range(B):
            idx = np.random.randint(0, N, N)
            y_t_b = y_true[idx]
            y_p_b = pred[idx]

            boot_acc.append(accuracy_score(y_t_b, y_p_b))
            boot_f1.append(f1_score(y_t_b, y_p_b, zero_division=0))
            boot_rec.append(recall_score(y_t_b, y_p_b, zero_division=0))
            boot_prec.append(precision_score(y_t_b, y_p_b, zero_division=0))

        ci_results[name] = {
            "Accuracy": (float(np.percentile(boot_acc, 2.5)), float(np.percentile(boot_acc, 97.5))),
            "Flood_F1": (float(np.percentile(boot_f1, 2.5)), float(np.percentile(boot_f1, 97.5))),
            "Flood_Recall": (float(np.percentile(boot_rec, 2.5)), float(np.percentile(boot_rec, 97.5))),
            "Flood_Precision": (float(np.percentile(boot_prec, 2.5)), float(np.percentile(boot_prec, 97.5))),
        }

    with open(FIGURES_DIR / "bootstrap_confidence_intervals.json", "w") as f:
        json.dump(ci_results, f, indent=2)

    return ci_results

if __name__ == "__main__":
    print("Generating Figure 1: Accuracy comparison...")
    generate_metric_comparison_chart("Accuracy", BASELINE_METRICS["Accuracy"], NEW_METRICS["Accuracy"], "figure_1_accuracy_comparison.png", ylabel="Accuracy")

    print("Generating Figure 2: Precision comparison...")
    generate_metric_comparison_chart("Flood Precision", BASELINE_METRICS["Precision"], NEW_METRICS["Precision"], "figure_2_precision_comparison.png", ylabel="Precision")

    print("Generating Figure 3: Recall comparison...")
    generate_metric_comparison_chart("Flood Recall (Sensitivity)", BASELINE_METRICS["Recall"], NEW_METRICS["Recall"], "figure_3_recall_comparison.png", ylabel="Recall (True Positive Rate)")

    print("Generating Figure 4: F1-Score comparison...")
    generate_metric_comparison_chart("Flood F1-Score", BASELINE_METRICS["F1"], NEW_METRICS["F1"], "figure_4_f1_comparison.png", ylabel="F1-Score")

    print("Generating Figure 5: Confusion Matrices...")
    generate_four_confusion_matrices()

    print("Generating Figure 6: Computational Efficiency...")
    generate_training_time_chart()

    print("Generating Figure 7: Dataset Size Comparison...")
    generate_dataset_size_chart()

    ci = compute_bootstrap_confidence_intervals()
    print("\nBootstrap 95% Confidence Intervals:")
    for m, c in ci.items():
        print(f"  {m}:")
        for metric, (lo, hi) in c.items():
            print(f"    {metric}: [{lo:.4f}, {hi:.4f}]")
    print("\nAll Phase 4 visualizations and statistical tests successfully generated!")
