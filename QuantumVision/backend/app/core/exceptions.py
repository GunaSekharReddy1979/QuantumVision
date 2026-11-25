from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.requests import ClientDisconnect
from app.core.logger import logger
from app.schemas.common import BaseResponse

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        cause = getattr(exc, "__cause__", None)
        # If client aborted/disconnected during body reading (e.g. navigation or aborted fetch)
        if isinstance(cause, ClientDisconnect) or "disconnect" in str(cause).lower():
            logger.info(f"Client disconnected during {request.method} {request.url.path}")
            return JSONResponse(
                status_code=499,
                content=BaseResponse(
                    status="cancelled",
                    message="Client closed connection before completion"
                ).model_dump()
            )

        detail_msg = str(exc.detail)
        if cause:
            logger.error(f"HTTP {exc.status_code} on {request.method} {request.url.path}: {detail_msg} (Cause: {cause})")
        else:
            logger.error(f"HTTP {exc.status_code} on {request.method} {request.url.path}: {detail_msg}")

        return JSONResponse(
            status_code=exc.status_code,
            content=BaseResponse(
                status="error",
                message=detail_msg
            ).model_dump()
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content=BaseResponse(
                status="error",
                message="Validation Error",
                data=exc.errors()
            ).model_dump()
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=BaseResponse(
                status="error",
                message="An unexpected internal server error occurred."
            ).model_dump()
        )
