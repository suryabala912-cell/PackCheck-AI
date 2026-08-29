import pytest
from app.services.declaration_extractor import DeclarationExtractor, FIELD_NAMES

def test_all_8_fields_initialized():
    """Verify that all 8 required declaration fields are present in the output array"""
    empty_ocr = {"raw_text": "", "lines": [], "words": []}
    declarations = DeclarationExtractor.extract_declarations(empty_ocr)
    
    extracted_names = [d["field_name"] for d in declarations]
    assert len(declarations) == 8
    for field in FIELD_NAMES:
        assert field in extracted_names
        
    # All fields should be NOT_DETECTED for empty OCR
    for d in declarations:
        assert d["detection_status"] == "NOT_DETECTED"
        assert d["extracted_value"] is None
        assert d["confidence"] == 0.0

def test_net_quantity_extraction():
    """Test extraction of NET_QUANTITY pattern"""
    mock_ocr = {
        "raw_text": "Net Qty: 500 g",
        "lines": [{"line_number": 1, "text": "Net Qty: 500 g", "avg_confidence": 0.95}],
        "words": [
            {"text": "Net", "confidence": 0.95, "bounding_box": {"x": 10, "y": 10, "width": 30, "height": 15}},
            {"text": "Qty:", "confidence": 0.95, "bounding_box": {"x": 45, "y": 10, "width": 30, "height": 15}},
            {"text": "500", "confidence": 0.95, "bounding_box": {"x": 80, "y": 10, "width": 30, "height": 15}},
            {"text": "g", "confidence": 0.95, "bounding_box": {"x": 115, "y": 10, "width": 10, "height": 15}}
        ]
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    net_qty = next(d for d in declarations if d["field_name"] == "NET_QUANTITY")
    
    assert net_qty["detection_status"] == "DETECTED"
    assert net_qty["extracted_value"] == "500 g"
    assert net_qty["confidence"] == 0.95
    assert net_qty["bounding_box"] is not None
    assert net_qty["bounding_box"]["x"] == 10
    assert net_qty["bounding_box"]["width"] == 115

def test_mfg_date_extraction():
    """Test extraction of MFG_DATE pattern"""
    mock_ocr = {
        "raw_text": "Mfg Date: 05/2026",
        "lines": [{"line_number": 1, "text": "Mfg Date: 05/2026", "avg_confidence": 0.90}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    mfg_date = next(d for d in declarations if d["field_name"] == "MFG_DATE")
    
    assert mfg_date["detection_status"] == "DETECTED"
    assert mfg_date["extracted_value"] == "05/2026"

def test_mrp_extraction():
    """Test extraction of MRP pattern"""
    mock_ocr = {
        "raw_text": "MRP Rs. 250.00 (Incl. of all taxes)",
        "lines": [{"line_number": 1, "text": "MRP Rs. 250.00 (Incl. of all taxes)", "avg_confidence": 0.92}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    mrp = next(d for d in declarations if d["field_name"] == "MRP")
    
    assert mrp["detection_status"] == "DETECTED"
    assert "250.00" in mrp["source_text"]

def test_unit_sale_price_extraction():
    """Test extraction of UNIT_SALE_PRICE pattern"""
    mock_ocr = {
        "raw_text": "USP Rs. 0.50 / g",
        "lines": [{"line_number": 1, "text": "USP Rs. 0.50 / g", "avg_confidence": 0.88}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    usp = next(d for d in declarations if d["field_name"] == "UNIT_SALE_PRICE")
    
    assert usp["detection_status"] == "DETECTED"

def test_consumer_care_extraction():
    """Test extraction of CONSUMER_CARE pattern"""
    mock_ocr = {
        "raw_text": "Consumer Care: care@brand.com Tel: 1800-123-4567",
        "lines": [{"line_number": 1, "text": "Consumer Care: care@brand.com Tel: 1800-123-4567", "avg_confidence": 0.85}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    care = next(d for d in declarations if d["field_name"] == "CONSUMER_CARE")
    
    assert care["detection_status"] == "DETECTED"

def test_country_of_origin_extraction():
    """Test extraction of COUNTRY_OF_ORIGIN pattern"""
    mock_ocr = {
        "raw_text": "Country of Origin: India",
        "lines": [{"line_number": 1, "text": "Country of Origin: India", "avg_confidence": 0.94}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    origin = next(d for d in declarations if d["field_name"] == "COUNTRY_OF_ORIGIN")
    
    assert origin["detection_status"] == "DETECTED"
    assert "India" in origin["extracted_value"]

def test_manufacturer_address_extraction():
    """Test extraction of MANUFACTURER_ADDRESS pattern"""
    mock_ocr = {
        "raw_text": "Mfd. by: Sample Foods Pvt Ltd, Plot 12, Industrial Area, Mumbai",
        "lines": [{"line_number": 1, "text": "Mfd. by: Sample Foods Pvt Ltd, Plot 12, Industrial Area, Mumbai", "avg_confidence": 0.89}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    addr = next(d for d in declarations if d["field_name"] == "MANUFACTURER_ADDRESS")
    
    assert addr["detection_status"] == "DETECTED"
    assert "Sample Foods" in addr["extracted_value"]

def test_commodity_name_extraction():
    """Test extraction of COMMODITY_NAME pattern"""
    mock_ocr = {
        "raw_text": "Generic Name: Roasted Almonds",
        "lines": [{"line_number": 1, "text": "Generic Name: Roasted Almonds", "avg_confidence": 0.87}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    comm = next(d for d in declarations if d["field_name"] == "COMMODITY_NAME")
    
    assert comm["detection_status"] == "DETECTED"
    assert "Almonds" in comm["extracted_value"]

def test_low_confidence_status():
    """Test that line confidence below threshold returns LOW_CONFIDENCE status"""
    mock_ocr = {
        "raw_text": "Net Qty: 250 g",
        "lines": [{"line_number": 1, "text": "Net Qty: 250 g", "avg_confidence": 0.40}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    net_qty = next(d for d in declarations if d["field_name"] == "NET_QUANTITY")
    
    assert net_qty["detection_status"] == "LOW_CONFIDENCE"
    assert net_qty["confidence"] == 0.40

def test_malformed_text_no_crash():
    """Test that garbage/malformed OCR text does not crash the extractor"""
    mock_ocr = {
        "raw_text": "!!! ### @@@ --- 12345 xyz ???",
        "lines": [{"line_number": 1, "text": "!!! ### @@@ --- 12345 xyz ???", "avg_confidence": 0.10}],
        "words": []
    }
    declarations = DeclarationExtractor.extract_declarations(mock_ocr)
    assert len(declarations) == 8
    for d in declarations:
        assert d["detection_status"] == "NOT_DETECTED"
