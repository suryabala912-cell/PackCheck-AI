import io
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.core.config import settings

client = TestClient(app)

def create_image_bytes(width=100, height=100):
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    byte_arr = io.BytesIO()
    img.save(byte_arr, format="JPEG")
    byte_arr.seek(0)
    return byte_arr

def test_file_size_limit_exceeded():
    """Test that file exceeding MAX_UPLOAD_SIZE_BYTES returns HTTP 413"""
    # Create payload slightly larger than setting threshold
    original_max = settings.MAX_UPLOAD_SIZE_BYTES
    settings.MAX_UPLOAD_SIZE_BYTES = 100  # Set small limit for testing
    
    try:
        large_data = io.BytesIO(b"X" * 200)
        files = {"file": ("large_image.jpg", large_data, "image/jpeg")}
        response = client.post("/api/v1/extract", files=files)
        
        assert response.status_code == 413
        assert "exceeds maximum permitted limit" in response.json()["detail"]
    finally:
        settings.MAX_UPLOAD_SIZE_BYTES = original_max

def test_image_dimension_too_small():
    """Test that image with dimensions below MIN_IMAGE_DIMENSION returns HTTP 400"""
    small_img_bytes = create_image_bytes(width=5, height=5)
    files = {"file": ("tiny.jpg", small_img_bytes, "image/jpeg")}
    response = client.post("/api/v1/extract", files=files)
    
    assert response.status_code == 400
    assert "dimensions" in response.json()["detail"].lower()

def test_valid_image_returns_process_time_header():
    """Test that valid image request includes X-Process-Time-Sec header"""
    valid_bytes = create_image_bytes(width=150, height=100)
    files = {"file": ("normal.jpg", valid_bytes, "image/jpeg")}
    response = client.post("/api/v1/extract", files=files)
    
    assert response.status_code == 200
    assert "X-Process-Time-Sec" in response.headers

def test_empty_file_upload_rejected():
    """Test that empty 0-byte file returns HTTP 400"""
    empty_bytes = io.BytesIO(b"")
    files = {"file": ("empty.jpg", empty_bytes, "image/jpeg")}
    response = client.post("/api/v1/extract", files=files)
    
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
