"""
QuantumVision Dataset Split & Leakage Audit Module.
Ensures reproducible, stratified train-test splits persisted to disk,
and performs systematic spatial and feature leakage audits.
"""
from pathlib import Path
import json
from typing import Tuple, Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FEATURES_DIR = PROJECT_ROOT / "data" / "features"
SPLIT_FILE = FEATURES_DIR / "train_test_split_indices.json"

def get_or_create_split_indices(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = 42,
    stratify_col: str = "flood_label",
    force_recreate: bool = False
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Retrieves persisted stratified train-test split indices or creates and persists
    a single reproducible split.
    """
    total_len = len(df)
    
    if SPLIT_FILE.exists() and not force_recreate:
        try:
            with open(SPLIT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            train_idx = np.array(data["train_indices"], dtype=int)
            test_idx = np.array(data["test_indices"], dtype=int)
            if len(train_idx) + len(test_idx) == total_len and max(max(train_idx), max(test_idx)) < total_len:
                return train_idx, test_idx, data
        except Exception as e:
            print(f"[SplitManager] Error loading persisted split indices: {e}. Recreating split...")

    # Create stratified split
    all_indices = np.arange(total_len)
    stratify_vals = df[stratify_col].values if stratify_col in df.columns else None
    
    train_idx, test_idx = train_test_split(
        all_indices,
        test_size=test_size,
        random_state=random_state,
        stratify=stratify_vals
    )

    metadata = {
        "dataset_name": "flood_training_samples.csv",
        "total_samples": total_len,
        "train_samples": len(train_idx),
        "test_samples": len(test_idx),
        "test_size": test_size,
        "random_state": random_state,
        "stratify_column": stratify_col,
        "train_class_distribution": {
            str(k): int(v) for k, v in df.iloc[train_idx][stratify_col].value_counts().items()
        } if stratify_col in df.columns else {},
        "test_class_distribution": {
            str(k): int(v) for k, v in df.iloc[test_idx][stratify_col].value_counts().items()
        } if stratify_col in df.columns else {},
        "train_indices": train_idx.tolist(),
        "test_indices": test_idx.tolist()
    }

    FEATURES_DIR.mkdir(parents=True, exist_ok=True)
    with open(SPLIT_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return train_idx, test_idx, metadata


def audit_dataset_leakage(
    df: pd.DataFrame,
    train_idx: np.ndarray,
    test_idx: np.ndarray,
    feature_cols: List[str],
    label_col: str = "flood_label"
) -> Dict[str, Any]:
    """
    Audits duplicate coordinates, spatial cross-split leakage, and feature-derived labels.
    Provides guidance for future expanded datasets.
    """
    has_coords = "latitude" in df.columns and "longitude" in df.columns

    # 1. Coordinate duplication audit
    duplicate_coord_count = 0
    duplicate_coord_rows = 0
    coord_leakage_count = 0

    if has_coords:
        coord_series = df["latitude"].round(5).astype(str) + "_" + df["longitude"].round(5).astype(str)
        dup_mask = coord_series.duplicated(keep=False)
        duplicate_coord_rows = int(dup_mask.sum())
        duplicate_coord_count = int(coord_series.duplicated(keep='first').sum())

        train_coords = set(coord_series.iloc[train_idx])
        test_coords = set(coord_series.iloc[test_idx])
        coord_leakage_count = len(train_coords.intersection(test_coords))

    # 2. Feature-derived label audit (checking for collinearity/perfect rules)
    correlations = {}
    if label_col in df.columns:
        for c in feature_cols:
            if c in df.columns and pd.api.types.is_numeric_dtype(df[c]):
                corr = float(df[c].corr(df[label_col]))
                correlations[c] = round(corr, 4)

    perfect_predictors = [k for k, v in correlations.items() if abs(v) > 0.95]

    audit_report = {
        "dataset_sample_count": len(df),
        "total_unique_locations": int(coord_series.nunique()) if has_coords else "N/A",
        "duplicate_coordinate_records": duplicate_coord_rows,
        "duplicate_coordinate_pairs": duplicate_coord_count,
        "spatial_cross_split_leakage_locations": coord_leakage_count,
        "spatial_leakage_note": (
            f"Detected {coord_leakage_count} overlapping locations between train and test splits out of {len(test_idx)} test samples. "
            "For future expanded datasets, spatial block or mandal-based GroupKFold splitting is recommended."
            if coord_leakage_count > 0 else "No spatial cross-split coordinate overlap detected."
        ),
        "feature_label_correlations": correlations,
        "perfect_predictors_detected": perfect_predictors,
        "feature_derivation_leakage": len(perfect_predictors) > 0,
        "recommendations_for_expansion": [
            "Use Spatial GroupKFold clustering or Mandal administrative boundary grouping to eliminate spatial autocorrelation.",
            "Separate temporally staggered observations (e.g. baseline dry-season vs flood peak) by event timestamp rather than random shuffle.",
            "Remove collinear features such as 24h accumulated rainfall vs hourly intensity if they derive from a single sensor formula."
        ]
    }
    return audit_report

