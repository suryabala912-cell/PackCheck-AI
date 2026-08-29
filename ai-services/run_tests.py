import sys
import unittest
import io
import numpy as np
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.services.image_preprocessor import ImagePreprocessor
from app.services.text_normalizer import TextNormalizer
from app.services.declaration_extractor import DeclarationExtractor
from app.services.rule_engine import ComplianceRuleEngine
from app.core.config import settings

class TestAIServicePhase2Step8(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "UP")
        print("PASS: GET /health endpoint test")

    def test_hardening_dimension_check(self):
        img = Image.new("RGB", (5, 5), color="white")
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG")
        img_byte_arr.seek(0)
        
        files = {"file": ("tiny.jpg", img_byte_arr, "image/jpeg")}
        response = self.client.post("/api/v1/extract", files=files)
        self.assertEqual(response.status_code, 400)
        print("PASS: Production hardening dimension check test")

    def test_ocr_extract_full_pipeline(self):
        img = Image.new("RGB", (400, 150), color="white")
        draw = ImageDraw.Draw(img)
        draw.text((10, 20), "Net Qty: 500 g", fill="black")
        draw.text((10, 50), "Mfg Date: 05/2026", fill="black")
        
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG")
        img_byte_arr.seek(0)
        
        files = {"file": ("label.jpg", img_byte_arr, "image/jpeg")}
        response = self.client.post("/api/v1/extract", files=files)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("X-Process-Time-Sec", response.headers)
        data = response.json()
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("compliance_report", data)
        print("PASS: POST /api/v1/extract full hardened pipeline test")

if __name__ == "__main__":
    unittest.main()
