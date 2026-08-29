import os

class Settings:
    SERVICE_NAME: str = os.getenv("SERVICE_NAME", "PackCheck AI Microservice")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Maximum allowed upload size (default 10 MB)
    MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024)))
    
    # Image dimension limits (prevent decompression bomb / zero dimension crashes)
    MIN_IMAGE_DIMENSION: int = 10
    MAX_IMAGE_DIMENSION: int = 10000
    
    ALLOWED_CONTENT_TYPES: set = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/bmp"
    }

settings = Settings()
