"""
QuantumVision Core Application Configuration.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuantumVision"
    PROJECT_VERSION: str = "2.0.0"
    PROJECT_DESCRIPTION: str = "AI, Computer Vision, Physics Simulation & Hybrid Quantum Disaster Management & Digital Twin Platform"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "quantumvision_super_secret_production_key_2026_x99")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quantumvision.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8501",
        "http://127.0.0.1:8501",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Quantum Computing Settings
    QUANTUM_BACKEND: str = "default.qubit"
    NUM_QUBITS: int = 4
    QUANTUM_SHOTS: int = 1024
    USE_IBM_CLOUD: bool = False
    IBM_QUANTUM_TOKEN: str = os.getenv("IBM_QUANTUM_TOKEN", "")
    
    # Model Paths & Storage
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./results/trained_models")
    DATASET_DIR: str = os.getenv("DATASET_DIR", "./datasets")
    SIMULATION_CACHE_DIR: str = os.getenv("SIMULATION_CACHE_DIR", "./results/simulations")
    
    # WebSocket Configuration
    WS_HEARTBEAT_INTERVAL: int = 15

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
