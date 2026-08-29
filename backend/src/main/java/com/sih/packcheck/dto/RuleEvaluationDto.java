package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class RuleEvaluationDto {

    @JsonProperty("rule_code")
    private String ruleCode;

    @JsonProperty("legal_reference")
    private String legalReference;

    @JsonProperty("rule_name")
    private String ruleName;

    @JsonProperty("applicability_status")
    private String applicabilityStatus;

    @JsonProperty("evaluation_status")
    private String evaluationStatus;

    @JsonProperty("verification_status")
    private String verificationStatus;

    @JsonProperty("requires_human_review")
    private Boolean requiresHumanReview = true;

    @JsonProperty("evidence_text")
    private String evidenceText;

    @JsonProperty("bounding_box")
    private Map<String, Object> boundingBox;

    @JsonProperty("message")
    private String message;

    public RuleEvaluationDto() {}

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }

    public String getLegalReference() { return legalReference; }
    public void setLegalReference(String legalReference) { this.legalReference = legalReference; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getApplicabilityStatus() { return applicabilityStatus; }
    public void setApplicabilityStatus(String applicabilityStatus) { this.applicabilityStatus = applicabilityStatus; }

    public String getEvaluationStatus() { return evaluationStatus; }
    public void setEvaluationStatus(String evaluationStatus) { this.evaluationStatus = evaluationStatus; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public Boolean getRequiresHumanReview() { return requiresHumanReview; }
    public void setRequiresHumanReview(Boolean requiresHumanReview) { this.requiresHumanReview = requiresHumanReview; }

    public String getEvidenceText() { return evidenceText; }
    public void setEvidenceText(String evidenceText) { this.evidenceText = evidenceText; }

    public Map<String, Object> getBoundingBox() { return boundingBox; }
    public void setBoundingBox(Map<String, Object> boundingBox) { this.boundingBox = boundingBox; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
