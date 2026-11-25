# QuantumVision Machine Learning Subsystem

## Overview
The ML subsystem powers flood inundation probability and cyclone wind hazard predictions across the 26 districts of Andhra Pradesh, India.

## Subsystem Architecture
```
ml/
├── README.md
├── models/
│   ├── flood/           # Trained models (Random Forest / XGBoost / LightGBM)
│   ├── cyclone/         # Cyclone track and wind field regressors
│   └── common/          # Feature scalers and encoders
├── training/
│   ├── train_flood.py   # Training script for inundation models
│   ├── train_cyclone.py # Training script for wind & pressure models
│   ├── preprocessing.py # Outlier filtering and imputation
│   └── feature_engineering.py # Catchment area and coastal proximity features
├── inference/
│   ├── flood_inference.py     # Inundation probability inference
│   ├── cyclone_inference.py   # Wind speed estimation
│   ├── model_loader.py        # Safe model loading with fallback heuristics
│   └── prediction_pipeline.py # End-to-end composite inference
├── explainability/
│   ├── shap_explainer.py      # TreeSHAP kernel for gradient-boosted trees
│   ├── rule_explainer.py      # Rule-based fallback explanation
│   └── feature_importance.py  # Global MDI and permutation importance
└── evaluation/
    ├── evaluate_flood.py      # Precision-Recall and IoU evaluation
    ├── evaluate_cyclone.py    # RMSE and landfall position error
    └── metrics.py             # Custom GIS spatial loss metrics
```

## Safety and Governance Rules
1. **Honest Model Reporting**: No trained model is claimed without verified weights in `models/`. In absence of physical weights, the system transparently utilizes the validated rule-based engine (`RULE_BASED` status).
2. **No Fabricated Accuracy**: Benchmarks are evaluated on validated ground truth; no fabricated accuracy figures are permitted.
3. **SHAP Explanations**: Every prediction surfaces top contributing features (e.g., rainfall accumulation, elevation MSL, coastal proximity).