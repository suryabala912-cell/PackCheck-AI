from typing import List, Dict, Any, Optional
from app.schemas.compliance import RuleEvaluationResult, OverallComplianceReport

# Verification metadata directly aligned with docs/legal-rule-verification.md
RULE_DEFINITIONS = [
    {
        "code": "LM_RULE_01",
        "name": "Manufacturer / Packer / Importer Name & Address",
        "reference": "Rule 6(1)(a)",
        "field_key": "MANUFACTURER_ADDRESS",
        "verification_status": "NOT_VERIFIED",
        "default_applicable": True
    },
    {
        "code": "LM_RULE_02",
        "name": "Generic or Common Name of Commodity",
        "reference": "Rule 6(1)(b)",
        "field_key": "COMMODITY_NAME",
        "verification_status": "NOT_VERIFIED",
        "default_applicable": True
    },
    {
        "code": "LM_RULE_03",
        "name": "Net Quantity & Metric Unit Declaration",
        "reference": "Rule 6(1)(c), Schedule III & IV",
        "field_key": "NET_QUANTITY",
        "verification_status": "NOT_VERIFIED",
        "default_applicable": True
    },
    {
        "code": "LM_RULE_04",
        "name": "Month & Year of Manufacture / Pre-Packing",
        "reference": "Rule 6(1)(d)",
        "field_key": "MFG_DATE",
        "verification_status": "NEEDS_HUMAN_REVIEW",
        "default_applicable": True
    },
    {
        "code": "LM_RULE_05",
        "name": "Maximum Retail Price (MRP) & Tax Declaration",
        "reference": "Rule 6(1)(e)",
        "field_key": "MRP",
        "verification_status": "NOT_VERIFIED",
        "default_applicable": True
    },
    {
        "code": "LM_RULE_06",
        "name": "Consumer Care Helpline & Email Details",
        "reference": "Rule 6(1)(f)",
        "field_key": "CONSUMER_CARE",
        "verification_status": "NOT_VERIFIED",
        "default_applicable": True
    },
    {
        "code": "LM_RULE_07",
        "name": "Country of Origin (Imported Commodities)",
        "reference": "Rule 6(1)(g)",
        "field_key": "COUNTRY_OF_ORIGIN",
        "verification_status": "NOT_VERIFIED",
        "default_applicable": False  # Only applicable if imported
    },
    {
        "code": "LM_RULE_08",
        "name": "Unit Sale Price (USP) Declaration",
        "reference": "Rule 6(11) / GSR 779(E)",
        "field_key": "UNIT_SALE_PRICE",
        "verification_status": "NEEDS_HUMAN_REVIEW",
        "default_applicable": True
    }
]

class ComplianceRuleEngine:
    @classmethod
    def evaluate_compliance(
        cls,
        declarations: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> OverallComplianceReport:
        """
        Evaluates extracted packaged commodity declarations against Legal Metrology Rules (LM_RULE_01 - LM_RULE_08).
        Ensures unverified rules NEVER produce an unconditional PASS.
        """
        context = context or {}
        is_imported = context.get("is_imported", False)
        
        # Index declarations by field name
        decl_map = {d.get("field_name"): d for d in declarations}
        
        results: List[RuleEvaluationResult] = []
        
        verified_count = 0
        unverified_count = 0
        passed_count = 0
        failed_count = 0
        review_count = 0

        for rule in RULE_DEFINITIONS:
            code = rule["code"]
            ref = rule["reference"]
            name = rule["name"]
            field_key = rule["field_key"]
            ver_status = rule["verification_status"]

            # Step 1: Evaluate Applicability
            applicable = rule["default_applicable"]
            if code == "LM_RULE_07":
                applicable = is_imported
                
            if not applicable:
                results.append(RuleEvaluationResult(
                    rule_code=code,
                    legal_reference=ref,
                    rule_name=name,
                    applicability_status="NOT_APPLICABLE",
                    evaluation_status="NOT_APPLICABLE",
                    verification_status=ver_status,
                    requires_human_review=False,
                    evidence_text=None,
                    bounding_box=None,
                    message="Rule not applicable to this package context."
                ))
                continue

            # Step 2: Declaration Detection Analysis
            decl = decl_map.get(field_key, {})
            det_status = decl.get("detection_status", "NOT_DETECTED")
            extracted_val = decl.get("extracted_value")
            source_text = decl.get("source_text")
            bbox = decl.get("bounding_box")

            if det_status == "NOT_DETECTED" or not extracted_val:
                failed_count += 1
                unverified_count += 1
                results.append(RuleEvaluationResult(
                    rule_code=code,
                    legal_reference=ref,
                    rule_name=name,
                    applicability_status="APPLICABLE",
                    evaluation_status="FAIL",
                    verification_status=ver_status,
                    requires_human_review=True,
                    evidence_text=None,
                    bounding_box=None,
                    message=f"Mandatory declaration field ({field_key}) missing or not detected in OCR text."
                ))
                continue

            # Step 3: Rule Evaluation & Verification Constraint Handling
            # UNVERIFIED or NEEDS_HUMAN_REVIEW rules MUST NEVER produce unconditional PASS
            if ver_status in ("NOT_VERIFIED", "NEEDS_HUMAN_REVIEW"):
                unverified_count += 1
                review_count += 1
                
                eval_status = "NOT_VERIFIED" if ver_status == "NOT_VERIFIED" else "REVIEW"
                
                results.append(RuleEvaluationResult(
                    rule_code=code,
                    legal_reference=ref,
                    rule_name=name,
                    applicability_status="APPLICABLE",
                    evaluation_status=eval_status,
                    verification_status=ver_status,
                    requires_human_review=True,
                    evidence_text=source_text or extracted_val,
                    bounding_box=bbox,
                    message=f"Declaration detected ('{extracted_val}'). Rule legal status is {ver_status}; human officer review is required."
                ))
            else:
                # Rule is VERIFIED
                verified_count += 1
                passed_count += 1
                results.append(RuleEvaluationResult(
                    rule_code=code,
                    legal_reference=ref,
                    rule_name=name,
                    applicability_status="APPLICABLE",
                    evaluation_status="PASS",
                    verification_status="VERIFIED",
                    requires_human_review=False,
                    evidence_text=source_text or extracted_val,
                    bounding_box=bbox,
                    message=f"Statutory declaration detected and verified ('{extracted_val}')."
                ))

        # Step 4: Overall Status Calculation
        if failed_count > 0:
            overall_status = "NON_COMPLIANT"
        elif review_count > 0 or unverified_count > 0:
            overall_status = "NEEDS_HUMAN_OFFICER_REVIEW"
        else:
            overall_status = "COMPLIANT"

        disclaimer = (
            "PackCheck AI preliminary compliance assessment. "
            "Legal Metrology rules are subject to human officer verification. "
            "Automated outputs do not constitute a final legal decision."
        )

        return OverallComplianceReport(
            overall_status=overall_status,
            verified_rules_count=verified_count,
            unverified_rules_count=unverified_count,
            passed_rules_count=passed_count,
            failed_rules_count=failed_count,
            review_required_rules_count=review_count,
            rule_results=results,
            disclaimer=disclaimer
        )
