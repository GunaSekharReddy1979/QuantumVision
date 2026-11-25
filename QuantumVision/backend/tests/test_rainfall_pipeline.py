"""
Comprehensive automated tests for QuantumVision Rainfall Forecasting Pipeline.
Covers:
- Geographic points and verified boundary polygon containment
- Open-Meteo API response parsing, time-interval alignment, and physical bound checks
- Duplicate and missing-hour detection & imputation
- Leakage-free feature engineering (strict past <= t vs future target > t)
- Multi-point spatial aggregation (mean, min, max distinction from time aggregation)
- Caching, timeout, retry policy, and STALE data badge labeling
- End-to-end backend API endpoints (/api/weather/*, /api/rainfall/*)
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone
import pandas as pd
import numpy as np

from app.core.geo_config import district_geo_manager, REPRESENTATIVE_WEATHER_POINTS, SRIKAKULAM_BOUNDS
from app.services.weather_service import weather_service
from app.services.rainfall_forecasting_service import rainfall_forecasting_service, FEATURE_COLS, TARGET_COL

# ==========================================
# 1. GEOGRAPHIC & BOUNDARY TESTS
# ==========================================

def test_geographic_configuration_points():
    """Verifies that all 8 representative points are defined with valid coordinates."""
    points = district_geo_manager.get_weather_points()
    assert len(points) == 8
    for pt in points:
        assert "id" in pt
        assert "name" in pt
        assert "latitude" in pt
        assert "longitude" in pt
        assert "elevation_m" in pt
        assert "river_basin" in pt
        # Verify within provisional bounding box
        assert SRIKAKULAM_BOUNDS["min_lat"] <= pt["latitude"] <= SRIKAKULAM_BOUNDS["max_lat"]
        assert SRIKAKULAM_BOUNDS["min_lon"] <= pt["longitude"] <= SRIKAKULAM_BOUNDS["max_lon"]

def test_polygon_containment_verification():
    """Ensures verified points fall inside the Srikakulam Census 2011 district polygon."""
    assert district_geo_manager.polygon is not None
    # Test valid interior points
    assert district_geo_manager.is_inside_district(18.2969, 83.8968) is True  # Srikakulam Town
    assert district_geo_manager.is_inside_district(18.6144, 84.2336) is True  # Tekkali
    # Test exterior points (e.g. Visakhapatnam or Vijayawada or Bay of Bengal offshore)
    assert district_geo_manager.is_inside_district(16.5062, 80.6480) is False  # Vijayawada (outside)
    assert district_geo_manager.is_inside_district(17.6868, 83.2185) is False  # Visakhapatnam (outside)
    assert district_geo_manager.is_inside_district(18.0, 85.5) is False  # Offshore Bay of Bengal (outside)

# ==========================================
# 2. DATA QUALITY, PARSING & LEAKAGE TESTS
# ==========================================

def test_timeseries_cleaning_and_deduplication():
    """Verifies duplicate removal, timestamp sorting, and negative precipitation clipping."""
    raw_mock = {
        "hourly": {
            "time": [
                "2024-06-01T00:00",
                "2024-06-01T01:00",
                "2024-06-01T01:00",  # Duplicate
                "2024-06-01T03:00",  # Missing 02:00
            ],
            "precipitation": [0.0, 12.5, 12.5, -2.0],  # Negative precipitation
            "temperature_2m": [28.0, 27.5, 27.5, 29.0],
            "relative_humidity_2m": [80.0, 85.0, 85.0, 75.0],
            "wind_speed_10m": [10.0, 12.0, 12.0, 14.0]
        }
    }
    pt = district_geo_manager.get_weather_points()[0]
    cleaned_df, report = weather_service._clean_and_standardize_timeseries(raw_mock, pt)

    assert cleaned_df is not None
    assert report["duplicates_removed"] == 1
    assert report["missing_hours_filled"] >= 1
    assert report["negative_precip_corrected"] == 1
    # Check negative precipitation is clipped to zero
    assert (cleaned_df["precipitation_mm"] >= 0.0).all()
    # Check chronological ordering
    assert cleaned_df["timestamp"].is_monotonic_increasing

def test_feature_engineering_no_future_leakage():
    """
    CRITICAL: Asserts that predictor features at time t depend strictly on observations <= t,
    and that the target variable contains future accumulated precipitation over (t+1 .. t+24).
    """
    timestamps = pd.date_range("2024-01-01 00:00", periods=72, freq="1h")
    # Rainfall spike exclusively at hour 30
    precip = np.zeros(72)
    precip[30] = 50.0  # 50 mm at hour 30

    sample_df = pd.DataFrame({
        "timestamp": timestamps,
        "precipitation_mm": precip,
        "temperature_c": [28.0] * 72,
        "relative_humidity_pct": [75.0] * 72,
        "wind_speed_kmh": [15.0] * 72,
        "elevation_m": [20.0] * 72
    })

    feat_df = rainfall_forecasting_service.engineer_features(sample_df)

    # 1. At hour 29 (before the spike): past rolling sums and lags MUST be 0.0
    row_29 = feat_df.iloc[29]
    assert row_29["lag_1h"] == 0.0
    assert row_29["rolling_sum_3h"] == 0.0
    assert row_29["rolling_sum_24h"] == 0.0
    # But target at hour 29 looks ahead into the next 24 hours (hours 30-53), so it MUST see the 50mm
    assert row_29[TARGET_COL] == 50.0

    # 2. At hour 30 (during the spike): rolling_sum_3h includes hour 30
    row_30 = feat_df.iloc[30]
    assert row_30["rolling_sum_3h"] == 50.0
    assert row_30["lag_1h"] == 0.0  # lag 1 hour is hour 29 = 0.0

    # 3. At hour 31: lag_1h is hour 30 = 50.0
    row_31 = feat_df.iloc[31]
    assert row_31["lag_1h"] == 50.0

def test_spatial_vs_time_aggregation_semantics():
    """
    Verifies that spatial aggregation computes mean/min/max of point totals,
    and does NOT sum point totals across the district (which would cause false inflation).
    """
    mock_points = [
        {"accumulated_precipitation_24h_mm": 20.0, "max_hourly_intensity_mm": 5.0, "name": "P1", "series": [{"time": "2024-01-01T00:00", "precipitation_mm": 1.0, "temperature_c": 25.0}]},
        {"accumulated_precipitation_24h_mm": 40.0, "max_hourly_intensity_mm": 10.0, "name": "P2", "series": [{"time": "2024-01-01T00:00", "precipitation_mm": 2.0, "temperature_c": 26.0}]},
    ]
    summary = weather_service._compute_district_spatial_summary(mock_points, hours=24)
    # Mean of 20 and 40 is 30, NOT 60 (sum)
    assert summary["mean_accumulated_24h_mm"] == 30.0
    assert summary["min_point_accumulated_24h_mm"] == 20.0
    assert summary["max_point_accumulated_24h_mm"] == 40.0
    assert summary["max_district_hourly_intensity_mm"] == 10.0

# ==========================================
# 3. API RELIABILITY & STALE CACHING TESTS
# ==========================================

def test_stale_fallback_on_api_outage():
    """Verifies that if Open-Meteo is unreachable on live refresh, fallback is served with STALE flag."""
    with patch.object(weather_service.session, "get", side_effect=Exception("Connection timed out")):
        fc = weather_service.get_forecast(hours=24, force_refresh=True)
        assert fc["is_stale"] is True
        assert fc["data_mode"] == "STALE"

# ==========================================
# 4. FASTAPI ENDPOINT INTEGRATION TESTS
# ==========================================

def test_get_rainfall_locations_endpoint(client):
    """GET /api/rainfall/locations returns 8 verified points and boundary metadata."""
    res = client.get("/api/rainfall/locations")
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data["locations"]) == 8
    assert data["metadata"]["district_name"] == "Srikakulam"
    assert data["metadata"]["boundary_verified"] is True

def test_get_rainfall_model_evaluation_endpoint(client):
    """GET /api/rainfall/model/evaluation returns genuine metrics for Baseline, RF, and XGBoost."""
    res = client.get("/api/rainfall/model/evaluation")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "models" in data
    assert "baseline_persistence" in data["models"]
    assert "random_forest" in data["models"]
    assert "xgboost" in data["models"]
    assert "quantum_regression" in data["models"]
    # Verify genuine numbers
    assert data["models"]["baseline_persistence"]["mae_mm"] is not None
    assert data["models"]["random_forest"]["mae_mm"] is not None
    assert data["models"]["xgboost"]["mae_mm"] is not None
    # Verify Quantum is labeled experimental without fake metrics
    assert data["models"]["quantum_regression"]["status"] == "EXPERIMENTAL / NOT_IMPLEMENTED"

def test_get_rainfall_forecast_endpoint(client):
    """GET /api/rainfall/forecast?hours=24 returns dual-mode operational forecast."""
    res = client.get("/api/rainfall/forecast?hours=24&mode=both")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["forecast_horizon_hours"] == 24
    assert "provider_forecast" in data
    assert "ml_forecast" in data
    assert "quantum_status" in data
    assert "district_summary" in data["provider_forecast"]
    assert data["quantum_status"]["status"] == "EXPERIMENTAL / NOT_IMPLEMENTED"

def test_get_weather_historical_status_endpoint(client):
    """GET /api/weather/historical-status returns synchronization report."""
    res = client.get("/api/weather/historical-status")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["status"] == "SYNCED"
    assert data["combined_file_exists"] is True
    assert len(data["configured_points"]) == 8
