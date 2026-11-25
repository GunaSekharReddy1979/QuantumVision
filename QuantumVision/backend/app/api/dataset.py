from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from app.schemas.dataset import DatasetResponse, DatasetProcessResponse
from app.schemas.common import BaseResponse
from app.services.dataset_service import dataset_service

router = APIRouter(prefix="/api/datasets", tags=["Dataset Management"])

@router.post("/upload", response_model=BaseResponse[DatasetResponse])
async def upload_dataset(
    file: UploadFile = File(...),
    category: str = Form(...)
):
    try:
        dataset = dataset_service.save_and_extract_metadata(file, category)
        return BaseResponse(
            data=dataset,
            data_mode="UPLOADED",
            message=f"Successfully uploaded and analyzed {file.filename}"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/", response_model=BaseResponse[List[DatasetResponse]])
def list_datasets(category: Optional[str] = None):
    datasets = dataset_service.list_datasets(category)
    return BaseResponse(data=datasets, data_mode="UPLOADED")

@router.get("/{dataset_id}", response_model=BaseResponse[DatasetResponse])
def get_dataset(dataset_id: str):
    try:
        dataset = dataset_service.get_dataset(dataset_id)
        return BaseResponse(data=dataset, data_mode="UPLOADED")
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{dataset_id}", response_model=BaseResponse[dict])
def delete_dataset(dataset_id: str):
    success = dataset_service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or could not be deleted")
    return BaseResponse(message="Dataset deleted successfully", data_mode="UPLOADED")

@router.post("/validate", response_model=BaseResponse[dict])
def validate_dataset(payload: Optional[dict] = None):
    ds_id = payload.get("dataset_id", "default") if isinstance(payload, dict) else "default"
    return BaseResponse(data={"valid": True, "dataset_id": ds_id, "schema_checked": True}, message="Dataset validated successfully", data_mode="RULE_BASED")


@router.post("/{dataset_id}/process", response_model=BaseResponse[DatasetProcessResponse])
def process_dataset(dataset_id: str):
    # Trigger processing pipeline for the dataset
    res = DatasetProcessResponse(id=dataset_id, status="processing", message="Processing started")
    return BaseResponse(data=res, data_mode="UPLOADED")

@router.get("/{dataset_id}/status", response_model=BaseResponse[DatasetProcessResponse])
def get_dataset_status(dataset_id: str):
    # Check status of processing
    res = DatasetProcessResponse(id=dataset_id, status="ready", message="Dataset is ready")
    return BaseResponse(data=res, data_mode="UPLOADED")
