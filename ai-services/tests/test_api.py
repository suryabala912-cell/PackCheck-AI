import io
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
from app.main import app

client = TestClient(app)

def create_synthetic_label_image(text="NET QTY: 500g"):
    """Generates an in-memory synthetic product label image with text"""
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((10, 40), text, fill=(0, 0, 0))
    
    byte_arr = io.BytesIO()
    img.save(byte_arr, format="JPEG")
    byte_arr.seek(0)
    return byte_arr

def test_health_endpoint():
    """Test GET /health endpoint returns 200 OK and UP status"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "PackCheck AI Microservice"

def test_extract_endpoint_ocr_response():
    """Test POST /api/v1/extract returns structured OCR output, normalized text, and confidence status"""
    img_byte_arr = create_synthetic_label_image("NET QTY 500g MRP 100")
    files = {"file": ("synthetic_label.jpg", img_byte_arr, "image/jpeg")}
    
    response = client.post("/api/v1/extract", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["filename"] == "synthetic_label.jpg"
    assert data["content_type"] == "image/jpeg"
    assert data["size_bytes"] > 0
    assert "ocr_engine" in data
    assert "raw_text" in data
    assert "normalized_text" in data
    assert "overall_ocr_confidence" in data
    assert "ocr_quality_status" in data
    assert data["ocr_quality_status"] in ("HIGH_CONFIDENCE", "MEDIUM_CONFIDENCE", "LOW_CONFIDENCE")
    assert "word_count" in data
    assert isinstance(data["words"], list)
    assert isinstance(data["lines"], list)
    assert isinstance(data["declarations"], list)
    assert len(data["declarations"]) == 8

def test_extract_endpoint_invalid_file():
    """Test POST /api/v1/extract with a non-image file returns 400 Bad Request"""
    text_data = io.BytesIO(b"This is a text file, not an image.")
    files = {"file": ("document.txt", text_data, "text/plain")}
    response = client.post("/api/v1/extract", files=files)
    
    assert response.status_code == 400
    data = response.json()
    assert "Invalid image format" in data["detail"]
