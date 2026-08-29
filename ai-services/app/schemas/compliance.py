from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RuleEvaluationResult(BaseModel):
    rule_code: str
    legal_reference: str
    rule_name: str
    applicability_status: str  # APPLICABLE, NOT_APPLICABLE
    evaluation_status: str     # PASS, FAIL, REVIEW, NOT_APPLICABLE, NOT_VERIFIED
    verification_status: str   # NOT_VERIFIED, NEEDS_HUMAN_REVIEW, VERIFIED
    requires_human_review: bool
    evidence_text: Optional[str] = None
    bounding_box: Optional[Dict[str, int]] = None
    message: str

class OverallComplianceReport(BaseModel):
    overall_status: str  # COMPLIANT, NON_COMPLIANT, NEEDS_HUMAN_OFFICER_REVIEW
    verified_rules_count: int
    unverified_rules_count: int
    passed_rules_count: int
    failed_rules_count: int
    review_required_rules_count: int
    rule_results: List[RuleEvaluationResult]
    disclaimer: str
