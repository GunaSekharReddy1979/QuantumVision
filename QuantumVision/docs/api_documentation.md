# QuantumVision REST API Reference

The backend exposes RESTful endpoints with standard JSON envelopes:
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-20T18:00:00.000Z"
}
```

## System & Health
- `GET /api/health`: Diagnostic health check of backend services.
- `GET /docs`: OpenAPI Swagger interactive UI.

## Locations (Andhra Pradesh)
- `GET /api/locations/districts`: List all 26 districts of Andhra Pradesh with population and risk tags.
- `GET /api/locations/search?q={query}`: Fuzzy district and headquarters search.
- `POST /api/locations/select`: Select active district and coordinate center.
- `POST /api/locations/validate`: Validate whether coordinates fall within AP bounding box.

## Datasets
- `GET /api/datasets`: List registered geospatial datasets.
- `GET /api/datasets/{dataset_id}`: Retrieve dataset metadata.
- `POST /api/datasets/upload`: Multipart upload of GeoJSON/GeoTIFF/CSV datasets.
- `POST /api/datasets/validate`: Validate CRS and feature geometry.
- `POST /api/datasets/{dataset_id}/process`: Reproject to EPSG:4326 and compute spatial indexes.
- `GET /api/datasets/{dataset_id}/status`: Check ingestion progress.

## Hazards (Flood & Cyclone)
- `GET /api/hazards/flood`: Regional flood summary for Krishna and Godavari basins.
- `GET /api/hazards/cyclone`: Regional cyclone bulletin for Bay of Bengal coastal corridor.
- `POST /api/hazards/flood/analyze`: Inundation probability and water level lookup.
- `POST /api/hazards/cyclone/analyze`: Wind speed and central pressure lookup.

## Risk & Explainability
- `POST /api/risk/predict`: Composite risk index (Low, Moderate, High, Critical).
- `POST /api/risk/explain`: SHAP-compatible feature contributions.
- `POST /api/explainability/risk`: Explain risk predictions.
- `POST /api/explainability/route`: Explain route choice penalties.

## Facilities
- `GET /api/facilities`: List shelters and hospitals.
- `GET /api/facilities/nearby?lat={lat}&lon={lon}&radius_km={r}`: Proximity search.
- `POST /api/facilities/recommend`: Optimal shelter recommendation.

## Routing
- `POST /api/routing/route`: Primary safest practical evacuation path (A*).
- `POST /api/routing/alternatives`: Multi-route alternatives (elevated ridge vs bypass).
- `POST /api/routing/recalculate`: Dynamic rerouting during rising water levels.
- `GET /api/routing/status`: Engine operational status.

## Simulation
- `POST /api/simulation/create`: Initialize dynamic time-step disaster simulation.
- `GET /api/simulation/{simulation_id}`: Current time-step state.
- `POST /api/simulation/{simulation_id}/step`: Advance simulation by N hours.
- `POST /api/simulation/{simulation_id}/reset`: Reset scenario to step 0.

## Quantum-Inspired
- `GET /api/quantum/status`: Annealing engine status and simulated qubit count.
- `POST /api/quantum/optimize-route`: QUBO simulated annealing path optimization.