"""
Tests for AI & Quantum Model API Endpoints (/api/models/*).
Verifies:
- /api/models/status
- /api/models/benchmark
- /api/models/dataset-stats
- /api/models/baseline
- /api/models/comparison
- /api/models/feature-importance
"""
from app.api.models import (
    get_models_status,
    get_benchmark_comparison,
    get_dataset_stats,
    get_baseline_metrics,
    get_model_comparison,
    get_feature_importance,
)

def test_models_status():
    res = get_models_status()
    assert res.status == "success"
    data = res.data
    assert "classical_models" in data
    assert "quantum_models" in data
    assert data["classical_models"]["random_forest"]["loaded"] is True
    assert data["classical_models"]["xgboost"]["loaded"] is True
    assert data["quantum_models"]["vqc"]["loaded"] is True
    assert data["quantum_models"]["qnn"]["loaded"] is True
    assert data["dataset_size"] == 5000
    assert data["splits"]["training"] == 3018
    assert data["splits"]["testing"] == 982

def test_models_benchmark():
    res = get_benchmark_comparison()
    assert res.status == "success"
    payload = res.data
    assert "models" in payload
    assert "random_forest" in payload["models"]
    assert "xgboost" in payload["models"]
    assert "vqc_quantum" in payload["models"]
    assert "qnn_quantum" in payload["models"]
    
    # Assert model metrics
    rf = payload["models"]["random_forest"]
    assert rf["accuracy"] == 0.998
    assert rf["precision"] == 1.0
    assert rf["recall"] == 0.9877
    assert rf["f1_score"] == 0.9938
    assert rf["confusion_matrix"] == [[820, 0], [2, 160]]
    assert rf["training_time_s"] == 2.6
    assert rf["inference_latency_ms"] == 0.007

    qnn = payload["models"]["qnn_quantum"]
    assert qnn["accuracy"] == 0.9012
    assert qnn["f1_score"] == 0.7454
    assert qnn["confusion_matrix"] == [[743, 77], [20, 142]]

    vqc = payload["models"]["vqc_quantum"]
    assert vqc["recall"] == 0.9383
    assert vqc["confusion_matrix"] == [[728, 92], [10, 152]]

    # Assert dataset_info
    assert "dataset_info" in payload
    info = payload["dataset_info"]
    assert info["expanded_dataset_size"] == 5000
    assert info["previous_dataset_size"] == 1500
    assert info["training_dataset_size"] == 3018
    assert info["validation_dataset_size"] == 1000
    assert info["testing_dataset_size"] == 982
    assert info["verified_flood_samples"] == 839

    # Assert baseline_comparison
    assert "baseline_comparison" in payload
    comp = payload["baseline_comparison"]
    assert "random_forest" in comp["models"]
    assert "xgboost" in comp["models"]
    assert "vqc_quantum" in comp["models"]
    assert "qnn_quantum" in comp["models"]
    assert comp["models"]["random_forest"]["improvements"]["accuracy_diff_pp"] == 0.13
    assert comp["models"]["qnn_quantum"]["improvements"]["accuracy_diff_pp"] == 33.79

def test_models_dataset_stats():
    res = get_dataset_stats()
    assert res.status == "success"
    stats = res.data
    assert stats["expanded_dataset_size"] == 5000
    assert stats["previous_dataset_size"] == 1500
    assert stats["training_dataset_size"] == 3018
    assert stats["testing_dataset_size"] == 982
    assert stats["verified_flood_samples"] == 839
    assert stats["verified_non_flood_samples"] == 4161
    assert stats["uncertain_or_excluded_samples"] == 118

def test_models_baseline_and_comparison():
    base_res = get_baseline_metrics()
    assert base_res.status == "success"
    base_data = base_res.data
    assert "models" in base_data
    assert base_data["total_samples"] == 1500
    assert base_data["test_sample_count"] == 300

    comp_res = get_model_comparison()
    assert comp_res.status == "success"
    comp_data = comp_res.data
    assert "models" in comp_data
    assert "xgboost" in comp_data["models"]
    assert comp_data["models"]["xgboost"]["improvements"]["accuracy_diff_pp"] == 0.13
    assert comp_data["models"]["vqc_quantum"]["improvements"]["recall_diff_pp"] == 9.62

def test_models_feature_importance():
    res = get_feature_importance()
    assert res.status == "success"
    assert len(res.data) > 0
    assert "features" in res.data
    assert "rainfall_accum_24h_mm" in res.data["features"]
    assert "random_forest_importance" in res.data
    assert "xgboost_importance" in res.data
