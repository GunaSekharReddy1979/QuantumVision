import uuid
from typing import List, Optional, Dict, Any
from app.schemas.location import Coordinate, LocationInfo, DistrictInfo, LocationValidateRequest, LocationSelectRequest

AP_BOUNDS = {
    "min_lat": 12.6,
    "max_lat": 19.5,
    "min_lon": 76.5,
    "max_lon": 85.0
}

class LocationService:
    def __init__(self):
        self.known_districts = [
            {"id": "srk", "name": "Srikakulam", "code": "SRK", "latitude": 18.2969, "longitude": 83.8968},
            {"id": "ntr", "name": "NTR (Vijayawada)", "code": "NTR", "latitude": 16.5062, "longitude": 80.6480},
            {"id": "vsp", "name": "Visakhapatnam", "code": "VSP", "latitude": 17.6868, "longitude": 83.2185},
            {"id": "vzm", "name": "Vizianagaram", "code": "VZM", "latitude": 18.1133, "longitude": 83.3977},
            {"id": "pvm", "name": "Parvathipuram Manyam", "code": "PVM", "latitude": 18.7796, "longitude": 83.4285},
            {"id": "eg", "name": "East Godavari", "code": "EG", "latitude": 17.0005, "longitude": 81.8040},
            {"id": "wg", "name": "West Godavari", "code": "WG", "latitude": 16.7107, "longitude": 81.0952},
            {"id": "kkn", "name": "Kakinada", "code": "KKN", "latitude": 16.9891, "longitude": 82.2475},
            {"id": "knm", "name": "Dr. B.R. Ambedkar Konaseema", "code": "KNM", "latitude": 16.5746, "longitude": 82.0016},
            {"id": "kri", "name": "Krishna", "code": "KRI", "latitude": 16.1875, "longitude": 81.1389},
            {"id": "gtr", "name": "Guntur", "code": "GTR", "latitude": 16.3067, "longitude": 80.4365},
            {"id": "pal", "name": "Palnadu", "code": "PAL", "latitude": 16.2403, "longitude": 79.9961},
            {"id": "bpt", "name": "Bapatla", "code": "BPT", "latitude": 15.9042, "longitude": 80.4674},
            {"id": "prk", "name": "Prakasam", "code": "PRK", "latitude": 15.5057, "longitude": 80.0499},
            {"id": "nel", "name": "Sri Potti Sriramulu Nellore", "code": "NEL", "latitude": 14.4426, "longitude": 79.9865}
        ]

    def is_in_andhra_pradesh(self, lat: float, lon: float) -> bool:
        return (AP_BOUNDS["min_lat"] <= lat <= AP_BOUNDS["max_lat"] and
                AP_BOUNDS["min_lon"] <= lon <= AP_BOUNDS["max_lon"])

    def validate_coordinate(self, coord: Coordinate) -> Dict[str, bool]:
        is_valid = self.is_in_andhra_pradesh(coord.latitude, coord.longitude)
        return {"valid": is_valid, "in_supported_region": is_valid}

    def get_districts(self) -> List[DistrictInfo]:
        return [DistrictInfo(name=d["name"], code=d["code"], id=d["id"], latitude=d["latitude"], longitude=d["longitude"]) for d in self.known_districts]

    def search_locations(self, query: str) -> List[Dict[str, Any]]:
        q = query.lower()
        results = []
        for d in self.known_districts:
            if q in d["name"].lower() or q in d["id"]:
                results.append({"name": d["name"], "id": d["id"], "type": "district"})
        if not results:
            results.append({"name": query.capitalize(), "id": "custom", "type": "location"})
        return results

    def select_location(self, req: LocationSelectRequest) -> LocationInfo:
        coord = req.coordinate or Coordinate(latitude=16.5062, longitude=80.6480)
        dist_id = req.district_id or "srk"
        matched_district = next((d for d in self.known_districts if d["id"] == dist_id), {"id": dist_id, "name": dist_id.upper()})

        return LocationInfo(
            location_id=str(uuid.uuid4()),
            name=req.place_name or matched_district["name"],
            type="custom",
            coordinate=coord,
            district=matched_district,
            state="Andhra Pradesh"
        )

    def get_location_by_id(self, location_id: str) -> LocationInfo:
        return LocationInfo(
            location_id=location_id,
            name="Srikakulam Command Center",
            type="command_center",
            coordinate=Coordinate(latitude=18.2969, longitude=83.8968),
            district={"id": "srk", "name": "Srikakulam"},
            state="Andhra Pradesh"
        )

location_service = LocationService()
