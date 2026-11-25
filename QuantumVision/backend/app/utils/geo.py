"""
Geospatial Calculations and Utilities.
"""
import math
from typing import List, Tuple, Dict, Any

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def point_in_hazard_zone(lat: float, lon: float, hazard_lat: float, hazard_lon: float, radius_km: float) -> bool:
    """Check if point is within hazard radius."""
    dist = haversine_distance_km(lat, lon, hazard_lat, hazard_lon)
    return dist <= radius_km

def generate_radial_polygon(center_lat: float, center_lon: float, radius_km: float, num_points: int = 16) -> List[List[float]]:
    """Generates geojson-compatible coordinate ring for a circular hazard perimeter."""
    points = []
    # Approx degrees per km
    deg_lat = radius_km / 111.0
    deg_lon = radius_km / (111.0 * math.cos(math.radians(center_lat)))
    
    for i in range(num_points):
        theta = (2.0 * math.pi * i) / num_points
        p_lat = center_lat + deg_lat * math.sin(theta)
        p_lon = center_lon + deg_lon * math.cos(theta)
        points.append([p_lon, p_lat])
    
    # Close polygon
    if points:
        points.append(points[0])
    return points
