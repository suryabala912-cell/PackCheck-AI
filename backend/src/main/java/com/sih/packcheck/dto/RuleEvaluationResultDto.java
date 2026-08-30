package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.packcheck.entity.RuleEvaluationResult;

import java.time.LocalDateTime;

public class RuleEvaluationResultDto {

    private Long id;

    @JsonProperty("rule_code")
    private String ruleCode;

    @JsonProperty("declaration_key")
    private String declarationKey;

    @JsonProperty("evaluation_status")
    private String evaluationStatus;

    @JsonProperty("reason_details")
    private String reasonDetails;

    @JsonProperty("evaluated_at")
    private LocalDateTime evaluatedAt;

    public RuleEvaluationResultDto() {}

    public RuleEvaluationResultDto(RuleEvaluationResult result) {
        this.id = result.getId();
        this.ruleCode = result.getRuleCode();
        this.declarationKey = result.getDeclarationKey();
        this.evaluationStatus = result.getEvaluationStatus() != null ? result.getEvaluationStatus().name() : null;
        this.reasonDetails = result.getReasonDetails();
        this.evaluatedAt = result.getEvaluatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }

    public String getDeclarationKey() { return declarationKey; }
    public void setDeclarationKey(String declarationKey) { this.declarationKey = declarationKey; }

    public String getEvaluationStatus() { return evaluationStatus; }
    public void setEvaluationStatus(String evaluationStatus) { this.evaluationStatus = evaluationStatus; }

    public String getReasonDetails() { return reasonDetails; }
    public void setReasonDetails(String reasonDetails) { this.reasonDetails = reasonDetails; }

    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
