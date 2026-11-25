"""
QuantumVision Middleware Configuration: CORS, Security Headers, Request Timing.
"""
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.core.logger import logger

class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Logs latency and adds X-Process-Time header to all HTTP responses."""
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000.0  # ms
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        if request.url.path not in ["/health", "/docs", "/openapi.json"]:
            logger.debug(f"{request.method} {request.url.path} completed in {process_time:.2f}ms with status {response.status_code}")
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Applies strict security and privacy headers."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

def setup_middleware(app: FastAPI):
    """Registers all middleware components with the FastAPI application."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestTimingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
