import pytest
from app.services.rule_engine import ComplianceRuleEngine, RULE_DEFINITIONS

def test_rule_definitions_count():
    """Verify rule engine contains definitions for all 8 rules LM_RULE_01 to LM_RULE_08"""
    assert len(RULE_DEFINITIONS) == 8
    rule_codes = [r["code"] for r in RULE_DEFINITIONS]
    for i in range(1, 9):
        assert f"LM_RULE_0{i}" in rule_codes

def test_unverified_rule_never_produces_pass():
    """
    SAFETY REQUIREMENT TEST: Unverified rules or rules needing human review
    MUST NEVER produce an unconditional PASS evaluation status.
    """
    mock_declarations = [
        {
            "field_name": "NET_QUANTITY",
            "extracted_value": "500 g",
            "source_text": "Net Qty: 500 g",
            "confidence": 0.95,
            "bounding_box": {"x": 10, "y": 10, "width": 100, "height": 20},
            "detection_status": "DETECTED"
        }
    ]
    report = ComplianceRuleEngine.evaluate_compliance(mock_declarations)
    net_qty_rule = next(r for r in report.rule_results if r.rule_code == "LM_RULE_03")
    
    assert net_qty_rule.verification_status == "NOT_VERIFIED"
    assert net_qty_rule.evaluation_status == "NOT_VERIFIED"
    assert net_qty_rule.evaluation_status != "PASS"
    assert net_qty_rule.requires_human_review is True

def test_missing_declaration_causes_fail():
    """Test that missing mandatory declaration produces FAIL evaluation status"""
    empty_declarations = []
    report = ComplianceRuleEngine.evaluate_compliance(empty_declarations)
    
    assert report.overall_status == "NON_COMPLIANT"
    assert report.failed_rules_count > 0
    
    mrp_rule = next(r for r in report.rule_results if r.rule_code == "LM_RULE_05")
    assert mrp_rule.evaluation_status == "FAIL"
    assert mrp_rule.requires_human_review is True

def test_country_of_origin_applicability_context():
    """Test that LM_RULE_07 is NOT_APPLICABLE for non-imported domestic goods"""
    mock_declarations = []
    # Test without import context (default domestic)
    report_domestic = ComplianceRuleEngine.evaluate_compliance(mock_declarations, context={"is_imported": False})
    origin_rule_dom = next(r for r in report_domestic.rule_results if r.rule_code == "LM_RULE_07")
    assert origin_rule_dom.applicability_status == "NOT_APPLICABLE"
    assert origin_rule_dom.evaluation_status == "NOT_APPLICABLE"

    # Test with import context
    report_imported = ComplianceRuleEngine.evaluate_compliance(mock_declarations, context={"is_imported": True})
    origin_rule_imp = next(r for r in report_imported.rule_results if r.rule_code == "LM_RULE_07")
    assert origin_rule_imp.applicability_status == "APPLICABLE"
    assert origin_rule_imp.evaluation_status == "FAIL"  # Missing origin declaration on imported pack

def test_overall_status_needs_officer_review_when_all_detected():
    """Test that overall status is NEEDS_HUMAN_OFFICER_REVIEW when all fields detected but unverified"""
    mock_declarations = [
        {"field_name": "MANUFACTURER_ADDRESS", "extracted_value": "Mumbai", "detection_status": "DETECTED"},
        {"field_name": "COMMODITY_NAME", "extracted_value": "Almonds", "detection_status": "DETECTED"},
        {"field_name": "NET_QUANTITY", "extracted_value": "500 g", "detection_status": "DETECTED"},
        {"field_name": "MFG_DATE", "extracted_value": "05/2026", "detection_status": "DETECTED"},
        {"field_name": "MRP", "extracted_value": "Rs. 100.00", "detection_status": "DETECTED"},
        {"field_name": "CONSUMER_CARE", "extracted_value": "care@brand.com", "detection_status": "DETECTED"},
        {"field_name": "UNIT_SALE_PRICE", "extracted_value": "Rs. 0.20/g", "detection_status": "DETECTED"}
    ]
    report = ComplianceRuleEngine.evaluate_compliance(mock_declarations)
    
    assert report.failed_rules_count == 0
    assert report.overall_status == "NEEDS_HUMAN_OFFICER_REVIEW"
    assert "preliminary compliance assessment" in report.disclaimer
