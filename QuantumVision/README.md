# QuantumVision: Intelligent Disaster Navigation and Emergency Evacuation Management

## Geographic Focus
**Andhra Pradesh, India** (Coastal corridor, Krishna Basin, Godavari Basin, Rayalaseema).

## Primary Disaster Types
1. **Flood** (Krishna & Godavari riverine inundation, urban flash flooding)
2. **Cyclone** (Bay of Bengal landfall, wind damage, coastal storm surge)

---

## 1. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.12)
- Node.js 18+ & npm

### Starting the Backend
From the project root:
```powershell
# Option A: Run directly with python
python backend/app.py

# Option B: Run with uvicorn CLI
python -m uvicorn app:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at:
- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/api/health`

### Starting the Frontend
From the `frontend` directory:
```powershell
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 2. Project Directory Structure
```
QuantumVision/
├── README.md
├── .gitignore
├── .env.example
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   ├── public/
│   │   ├── assets/ (icons, images, logos)
│   │   └── cesium/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/ (layout, dashboard, map, hazards, risk, datasets, facilities, routing, simulation, explainability, quantum, emergency)
│       ├── pages/ (OverviewPage, DetectionPage, DigitalTwinPage, SimulationPage, RoutingPage, FacilitiesPage, QuantumPage, ExplainabilityPage, EmergencyResponsePage)
│       ├── services/ (apiClient, healthApi, locationApi, datasetApi, hazardApi, riskApi, facilityApi, routingApi, simulationApi, explainabilityApi, quantumApi)
│       ├── hooks/ (useCesium, useMapLayers, useRisk, useRouting, useSimulation)
│       ├── context/ (AppContext, MapContext, SimulationContext)
│       ├── utils/ (formatters, geoUtils, riskUtils, validation)
│       └── styles/ (theme, layout, map, panels, animations)
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── .env.example
│   ├── pytest.ini
│   ├── api/ (health, locations, datasets, hazards, risk, facilities, routing, simulation, explainability, quantum)
│   ├── schemas/ (common, location, dataset, hazard, risk, facility, route, simulation, quantum)
│   ├── services/ (dataset_service, location_service, flood_service, cyclone_service, hazard_service, risk_service, facility_service, routing_service, simulation_service, explainability_service, quantum_service)
│   ├── gis/ (crs_utils, vector_processing, raster_processing, geojson_utils, geometry_validation, spatial_analysis)
│   ├── core/ (exceptions, dependencies, security)
│   ├── config/ (settings, logging)
│   ├── utils/ (file_utils, time_utils, response_utils)
│   └── tests/ (test_health, test_locations, test_datasets, test_hazards, test_risk, test_facilities, test_routing, test_simulation, test_explainability)
│
├── ml/
│   ├── README.md
│   ├── models/ (flood, cyclone, common)
│   ├── training/ (train_flood, train_cyclone, preprocessing, feature_engineering)
│   ├── inference/ (flood_inference, cyclone_inference, model_loader, prediction_pipeline)
│   ├── explainability/ (shap_explainer, rule_explainer, feature_importance)
│   └── evaluation/ (evaluate_flood, evaluate_cyclone, metrics)
│
├── quantum/
│   ├── README.md
│   ├── config.py
│   ├── qubo_formulation.py
│   ├── simulated_annealing.py
│   ├── route_optimization.py
│   ├── facility_optimization.py
│   └── classical_comparison.py
│
├── data/
│   ├── raw/ (flood, cyclone, common, terrain, roads, facilities, uploads)
│   ├── processed/ (flood, cyclone, common, terrain, roads, facilities)
│   └── features/ (flood_features.csv, cyclone_features.csv, combined_hazard_features.csv, feature_metadata.json)
│
├── notebooks/ (01_data_exploration, 02_flood_features, 03_cyclone_features, 04_risk_analysis, 05_route_analysis)
├── scripts/ (validate_datasets, process_gis_data, build_road_graph, generate_features, health_check)
├── docs/ (architecture, api_documentation, dataset_documentation, gis_workflow, model_documentation, routing_documentation, simulation_documentation)
└── tests/
    └── integration/ (test_frontend_backend, test_map_api)
```

---

## 3. Dataset Ingestion & File Placement
- **Raw Datasets**: Must be placed in `data/raw/` subdirectories (`flood/sentinel1/`, `cyclone/ibtracs/`, `terrain/dem/`, etc.).
- **Processed Datasets**: Stored in `data/processed/` with standardized `EPSG:4326` WGS84 coordinate reference system.
- **ML Features**: Generated into `data/features/` with schemas defined in `feature_metadata.json`.

---

## 4. Testing & Verification

### Running Backend Unit & Endpoint Tests
```powershell
python -m pytest backend/tests
```
Result: 31 passed tests covering all endpoints, schemas, GIS operations, and services.

### Running Integration Tests
```powershell
python -m pytest tests/integration
```
Result: 4 passed tests verifying GeoJSON and API response contracts.

### Running Health Diagnostic Script
```powershell
python scripts/health_check.py
```

### Running Dataset Validation Script
```powershell
python scripts/validate_datasets.py
```

### Running Frontend Build
```powershell
cd frontend
npm run build
```

---

## 5. Safety & Transparency Principles
1. **Honest Data Status**: Every hazard endpoint returns a data status flag (`LIVE`, `HISTORICAL`, `FORECAST`, `UPLOADED`, `MODEL_DERIVED`, `RULE_BASED`, `SIMULATED`, `DEMO`, or `UNAVAILABLE`).
2. **Evacuation Navigation**: Routes are presented as the "safest practical route based on available data"; real-time on-ground road passability may vary.
3. **Quantum-Inspired Heuristics**: Optimization algorithms are classical simulated annealing heuristics on QUBO matrices; no physical quantum hardware execution is claimed.
