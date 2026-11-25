from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class DatasetMetadata(BaseModel):
    crs_detected: Optional[str] = None
    crs_standardized: bool = False
    is_spatial: bool = False
    features_count: Optional[int] = None
    bbox: Optional[List[float]] = None
    file_extension: str
    original_filename: str

class DatasetResponse(BaseModel):
    id: str
    filename: str
    category: str
    size_bytes: int
    metadata: Optional[DatasetMetadata] = None
    status: str = "processing"

class DatasetProcessResponse(BaseModel):
    id: str
    status: str
    message: str
    errors: Optional[List[str]] = None
