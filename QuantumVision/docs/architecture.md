# QuantumVision System Architecture

## 1. High-Level Architecture
QuantumVision is an end-to-end intelligent disaster management and evacuation navigation system specialized for Andhra Pradesh, India.

```
+--------------------------------------------------------------------+
|                Vite + React.jsx + CesiumJS Frontend                |
|  - 3D GIS Digital Twin      - Cyberpunk Glassmorphism UI           |
|  - Real-time Alert HUD      - Evacuation Route Visualizer          |
+---------------------------------+----------------------------------+
                                  | HTTP / REST (VITE_API_BASE_URL)
                                  v
+--------------------------------------------------------------------+
|                      FastAPI Backend Engine                        |
|  - App Entry: backend/app.py                                       |
|  - Endpoints: /api/health, /locations, /hazards, /routing, etc.    |
+---------+--------------------+-------------------+-----------------+
          |                    |                   |
          v                    v                   v
+------------------+  +------------------+  +------------------------+
|  GIS Subsystem   |  |   ML Subsystem   |  |   Quantum-Inspired     |
| - GeoPandas      |  | - Preprocessing  |  | - QUBO Formulation     |
| - Rasterio       |  | - Random Forest  |  | - Simulated Annealing  |
| - Shapely        |  | - SHAP XAI       |  | - Classical Comparison |
+------------------+  +------------------+  +------------------------+
```

## 2. Directory Layout & Module Decoupling
- **`backend/`**: Pure Python FastAPI service with OS-agnostic path management (`config/settings.py`).
- **`frontend/`**: Vite single-page application with Cesium 3D globes and React contextual state.
- **`data/`**: Strict partitioning between `raw/`, `processed/`, and `features/`.
- **`ml/`**: Machine learning training, inference, and explainability.
- **`quantum/`**: Quantum-inspired simulated annealing optimizations.
- **`docs/`**: Comprehensive architectural and operational documentation.