from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import time
from app.api.router import router
from app.core.config import settings
from app.core.logging import logger

app = FastAPI(
    title=settings.SERVICE_NAME,
    description="Microservice providing image preprocessing, OCR extraction, text normalization, and Legal Metrology rule compliance evaluation.",
    version="1.0.0"
)

app.include_router(router)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    logger.info(f"{request.method} {request.url.path} Completed in {process_time:.4f}s Status: {response.status_code}")
    return response

@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning system operational status.
    """
    return {
        "status": "UP",
        "service": settings.SERVICE_NAME,
        "environment": settings.ENVIRONMENT
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler preventing unhandled internal errors from leaking stack traces.
    """
    logger.error(f"Unhandled server exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error during request processing."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation failure on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request payload validation failed.", "errors": exc.errors()}
    )
