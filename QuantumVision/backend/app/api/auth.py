"""
Authentication API Endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.schemas.common import BaseResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=BaseResponse[UserResponse])
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.register_user(db, req)
        return BaseResponse(data=UserResponse.from_orm(user), message="User registered successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=BaseResponse[TokenResponse])
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    try:
        token_res = auth_service.authenticate_user(db, req)
        return BaseResponse(data=token_res, message="Authentication successful")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
