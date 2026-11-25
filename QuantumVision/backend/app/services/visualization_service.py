"""
Geospatial Map Layers, Heatmaps and Chart Data Service.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.disaster import DisasterEvent
from app.models.shelter import Shelter
from app.models.hospital import Hospital
from app.schemas.visualization import MapLayersRequest, MapLayersResponse, HeatmapPoint
from app.utils.geo import generate_radial_polygon
from app.core.logger import logger

class VisualizationService:
    @staticmethod
    def get_map_layers(db: Session, req: MapLayersRequest) -> MapLayersResponse:
        hazards = db.query(DisasterEvent).filter(DisasterEvent.status == "active").all()
        shelters = db.query(Shelter).all()
        hospitals = db.query(Hospital).all()

        hazard_polys = []
        heatmap_pts: List[HeatmapPoint] = []

        for h in hazards:
            poly_coords = generate_radial_polygon(h.latitude, h.longitude, h.radius_km)
            hazard_polys.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [poly_coords]
                },
                "properties": {
                    "event_id": h.event_id,
                    "title": h.title,
                    "disaster_type": h.disaster_type,
                    "severity": h.severity,
                    "fillColor": "#ff2a2a" if h.disaster_type == "fire" else "#0088ff"
                }
            })
            # Generate local risk heatmap grid around hazard
            for dx in [-0.015, -0.007, 0.0, 0.007, 0.015]:
                for dy in [-0.015, -0.007, 0.0, 0.007, 0.015]:
                    heatmap_pts.append(HeatmapPoint(
                        latitude=h.latitude + dx,
                        longitude=h.longitude + dy,
                        intensity=max(0.2, 1.0 - ((dx**2 + dy**2)**0.5) / 0.025)
                    ))

        shelter_markers = [
            {
                "shelter_id": s.shelter_id,
                "name": s.name,
                "lat": s.latitude,
                "lon": s.longitude,
                "capacity": s.total_capacity,
                "occupancy": s.current_occupancy,
                "status": s.status
            }
            for s in shelters
        ]

        hospital_markers = [
            {
                "hospital_id": hp.hospital_id,
                "name": hp.name,
                "lat": hp.latitude,
                "lon": hp.longitude,
                "icu_available": hp.icu_beds_available,
                "status": hp.status
            }
            for hp in hospitals
        ]

        evacuation_paths = [
            {
                "route_id": "CORRIDOR-ALPHA-101",
                "status": "CLEAR",
                "coordinates": [
                    [-122.4194, 37.7749],
                    [-122.4180, 37.7780],
                    [-122.4167, 37.7833]
                ]
            }
        ]

        return MapLayersResponse(
            center={"lat": req.center_latitude, "lon": req.center_longitude},
            zoom=req.zoom_level,
            hazard_polygons=hazard_polys,
            heatmap_points=heatmap_pts,
            shelter_markers=shelter_markers,
            hospital_markers=hospital_markers,
            active_evacuation_paths=evacuation_paths
        )

visualization_service = VisualizationService()
