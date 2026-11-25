import os
import shutil
import uuid
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logger import logger
from app.schemas.dataset import DatasetMetadata, DatasetResponse, DatasetProcessResponse

SUPPORTED_EXTENSIONS = {'.csv', '.json', '.geojson', '.zip', '.shp', '.tif', '.tiff'}
ALLOWED_CATEGORIES = {"flood", "infrastructure", "common", "weather", "terrain", "roads", "shelters", "hospitals", "historical", "boundaries", "rivers"}

DEFAULT_REGISTERED_DATASETS = {
    "ds-boundary": {
        "id": "ds-boundary",
        "filename": "srikakulam_boundary_web.geojson",
        "category": "boundaries",
        "size_bytes": 9007,
        "status": "ready"
    },
    "ds-roads": {
        "id": "ds-roads",
        "filename": "srikakulam_roads.geojson",
        "category": "roads",
        "size_bytes": 14380532,
        "status": "ready"
    },
    "ds-rivers": {
        "id": "ds-rivers",
        "filename": "srikakulam_rivers.geojson",
        "category": "rivers",
        "size_bytes": 2276306,
        "status": "ready"
    },
    "ds-bridges": {
        "id": "ds-bridges",
        "filename": "srikakulam_bridges.geojson",
        "category": "infrastructure",
        "size_bytes": 648561,
        "status": "ready"
    },
    "ds-facilities": {
        "id": "ds-facilities",
        "filename": "srikakulam_facilities.geojson",
        "category": "shelters",
        "size_bytes": 75184,
        "status": "ready"
    },
    "ds-flood": {
        "id": "ds-flood",
        "filename": "srikakulam_flood_inundation.geojson",
        "category": "flood",
        "size_bytes": 1288768,
        "status": "ready"
    }
}

class DatasetService:
    def __init__(self):
        self.upload_dir = settings.DATASET_DIR
        for cat in ALLOWED_CATEGORIES:
            os.makedirs(os.path.join(self.upload_dir, cat), exist_ok=True)

    def validate_file(self, file) -> str:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file format {ext}. Allowed: {SUPPORTED_EXTENSIONS}")
        return ext

    def save_and_extract_metadata(self, file, category: str) -> DatasetResponse:
        if category not in ALLOWED_CATEGORIES:
            category = "common"

        ext = self.validate_file(file)
        safe_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        dataset_id = f"{category}_{safe_filename}"
        file_path = os.path.join(self.upload_dir, category, safe_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            logger.error(f"Failed to save file: {e}")
            raise RuntimeError("Failed to save uploaded file.")

        file_size = os.path.getsize(file_path)
        metadata = DatasetMetadata(
            file_extension=ext,
            original_filename=file.filename
        )

        return DatasetResponse(
            id=dataset_id,
            filename=safe_filename,
            category=category,
            size_bytes=file_size,
            metadata=metadata,
            status="uploaded"
        )

    def list_datasets(self, category: Optional[str] = None) -> List[DatasetResponse]:
        datasets = [DatasetResponse(**d) for d in DEFAULT_REGISTERED_DATASETS.values() if not category or d["category"] == category]
        categories = [category] if category and category in ALLOWED_CATEGORIES else ALLOWED_CATEGORIES

        for cat in categories:
            cat_dir = os.path.join(self.upload_dir, cat)
            if os.path.exists(cat_dir):
                for filename in os.listdir(cat_dir):
                    datasets.append(DatasetResponse(
                        id=f"{cat}_{filename}",
                        filename=filename,
                        category=cat,
                        size_bytes=os.path.getsize(os.path.join(cat_dir, filename)),
                        status="ready"
                    ))
        return datasets

    def get_dataset(self, dataset_id: str) -> DatasetResponse:
        if dataset_id in DEFAULT_REGISTERED_DATASETS:
            return DatasetResponse(**DEFAULT_REGISTERED_DATASETS[dataset_id])

        if "_" in dataset_id:
            category, filename = dataset_id.split("_", 1)
            file_path = os.path.join(self.upload_dir, category, filename)
            if os.path.exists(file_path):
                return DatasetResponse(
                    id=dataset_id,
                    filename=filename,
                    category=category,
                    size_bytes=os.path.getsize(file_path),
                    status="ready"
                )
        raise FileNotFoundError(f"Dataset {dataset_id} not found")

    def delete_dataset(self, dataset_id: str) -> bool:
        if dataset_id in DEFAULT_REGISTERED_DATASETS:
            return True
        if "_" in dataset_id:
            category, filename = dataset_id.split("_", 1)
            file_path = os.path.join(self.upload_dir, category, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        return False

dataset_service = DatasetService()
