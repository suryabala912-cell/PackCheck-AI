import pytest
import io
import cv2
import numpy as np
from PIL import Image, ImageDraw
from app.services.image_preprocessor import ImagePreprocessor

def create_synthetic_image(text="NET QTY: 500g", width=400, height=150, rotate_angle=0, bg_color=(255, 255, 255), text_color=(0, 0, 0)):
    """Helper to generate synthetic test images with text, custom colors, size, and rotation"""
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    draw.text((20, height // 3), text, fill=text_color)
    
    if rotate_angle != 0:
        img = img.rotate(rotate_angle, expand=False, fillcolor=bg_color)
        
    byte_arr = io.BytesIO()
    img.save(byte_arr, format="PNG")
    return byte_arr.getvalue()

def test_safe_image_decoding_valid():
    """Test decoding valid image bytes"""
    img_bytes = create_synthetic_image("Standard Horizontal Text")
    img_bgr = ImagePreprocessor.decode_image_safely(img_bytes)
    assert img_bgr is not None
    assert isinstance(img_bgr, np.ndarray)
    assert img_bgr.shape[0] > 0 and img_bgr.shape[1] > 0

def test_safe_image_decoding_invalid():
    """Test handling of corrupt or invalid image bytes"""
    with pytest.raises(ValueError):
        ImagePreprocessor.decode_image_safely(b"")

    with pytest.raises(Exception):
        ImagePreprocessor.decode_image_safely(b"Not an image data stream")

def test_very_small_image_upscaling():
    """Test graceful handling and upscaling of very small images (e.g., 40x20 px)"""
    img_bytes = create_synthetic_image("Micro Text", width=40, height=20)
    img_bgr = ImagePreprocessor.decode_image_safely(img_bytes)
    variants = ImagePreprocessor.preprocess_variants(img_bgr)
    
    primary = variants[0]
    assert primary["scale_factor"] > 1.0
    assert primary["orig_shape"] == (40, 20)
    assert primary["scaled_shape"][0] >= 300 or primary["scaled_shape"][1] >= 300

def test_deskew_angle_detection_rotated():
    """Test deskew detection for slightly rotated text"""
    img_bytes = create_synthetic_image("Rotated Label Text 05/2026", width=500, height=200, rotate_angle=10)
    img_bgr = ImagePreprocessor.decode_image_safely(img_bytes)
    variants = ImagePreprocessor.preprocess_variants(img_bgr)
    
    primary = variants[0]
    assert "skew_angle" in primary
    assert primary["orig_shape"] == (500, 200)

def test_low_contrast_text_preprocessing():
    """Test preprocessing variants on low contrast text (light gray text on white background)"""
    img_bytes = create_synthetic_image("Low Contrast Net Qty 250g", bg_color=(255, 255, 255), text_color=(200, 200, 200))
    img_bgr = ImagePreprocessor.decode_image_safely(img_bytes)
    variants = ImagePreprocessor.preprocess_variants(img_bgr)
    
    assert len(variants) == 3
    for v in variants:
        assert "image" in v
        assert v["image"].shape[0] > 0

def test_bounding_box_mapping_accuracy():
    """Test that coordinate mapping scales bounding boxes back to original image space"""
    bbox_proc = {"x": 150, "y": 90, "width": 100, "height": 40}
    scale_factor = 2.0
    orig_shape = (200, 100)
    
    mapped_bbox = ImagePreprocessor.map_bbox_to_original(
        bbox_proc=bbox_proc,
        scale_factor=scale_factor,
        orig_shape=orig_shape
    )
    
    assert mapped_bbox["x"] == 75
    assert mapped_bbox["y"] == 45
    assert mapped_bbox["width"] == 50
    assert mapped_bbox["height"] == 20
    # Coordinates must be within original dimensions
    assert mapped_bbox["x"] + mapped_bbox["width"] <= 200
    assert mapped_bbox["y"] + mapped_bbox["height"] <= 100
