import pytest
from app.services.text_normalizer import TextNormalizer

def test_ocr_text_normalization_whitespace_and_typos():
    """Test whitespace normalization and common character typo fixes (O -> 0, M.R.P -> MRP)"""
    raw = "M.R.P.   Rs.   1O0.00  \nNet  Quantity  :  500g\n  Mfg  Date :  05/2O26 "
    normalized = TextNormalizer.normalize_ocr_text(raw)
    
    assert "MRP" in normalized
    assert "Net Qty" in normalized
    assert "Rs. 100.00" in normalized
    assert "05/2026" in normalized
    # Excess spaces should be removed
    assert "   " not in normalized

def test_confidence_classification_high():
    """Test HIGH_CONFIDENCE classification for score >= 0.85"""
    words = [{"confidence": 0.90}, {"confidence": 0.95}, {"confidence": 0.88}]
    conf, status = TextNormalizer.calculate_overall_confidence(words, [])
    assert conf == 0.91
    assert status == "HIGH_CONFIDENCE"

def test_confidence_classification_medium():
    """Test MEDIUM_CONFIDENCE classification for score between 0.65 and 0.84"""
    words = [{"confidence": 0.70}, {"confidence": 0.75}, {"confidence": 0.68}]
    conf, status = TextNormalizer.calculate_overall_confidence(words, [])
    assert conf == 0.71
    assert status == "MEDIUM_CONFIDENCE"

def test_confidence_classification_low():
    """Test LOW_CONFIDENCE classification for score < 0.65"""
    words = [{"confidence": 0.40}, {"confidence": 0.50}, {"confidence": 0.30}]
    conf, status = TextNormalizer.calculate_overall_confidence(words, [])
    assert conf == 0.40
    assert status == "LOW_CONFIDENCE"

def test_empty_raw_text_normalization():
    """Test normalizing empty string returns empty string safely"""
    assert TextNormalizer.normalize_ocr_text("") == ""
    conf, status = TextNormalizer.calculate_overall_confidence([], [])
    assert conf == 0.0
    assert status == "LOW_CONFIDENCE"
