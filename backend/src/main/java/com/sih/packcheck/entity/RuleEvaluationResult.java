package com.sih.packcheck.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rule_evaluation_results")
public class RuleEvaluationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private ProductScan scan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private ComplianceRule rule;

    @Column(name = "rule_code", nullable = false, length = 50)
    private String ruleCode;

    @Column(name = "declaration_key", nullable = false, length = 50)
    private String declarationKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_status", nullable = false)
    private Status evaluationStatus = Status.MANUAL_REVIEW;

    @Column(name = "reason_details", columnDefinition = "TEXT")
    private String reasonDetails;

    @Column(name = "evaluated_at", nullable = false, updatable = false)
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    public enum Status {
        PASS, FAIL, NOT_APPLICABLE, MANUAL_REVIEW, NOT_DETECTED
    }

    public RuleEvaluationResult() {}

    public RuleEvaluationResult(String ruleCode, String declarationKey, Status evaluationStatus, String reasonDetails) {
        this.ruleCode = ruleCode;
        this.declarationKey = declarationKey;
        this.evaluationStatus = evaluationStatus;
        this.reasonDetails = reasonDetails;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductScan getScan() { return scan; }
    public void setScan(ProductScan scan) { this.scan = scan; }

    public ComplianceRule getRule() { return rule; }
    public void setRule(ComplianceRule rule) { this.rule = rule; }

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }

    public String getDeclarationKey() { return declarationKey; }
    public void setDeclarationKey(String declarationKey) { this.declarationKey = declarationKey; }

    public Status getEvaluationStatus() { return evaluationStatus; }
    public void setEvaluationStatus(Status evaluationStatus) { this.evaluationStatus = evaluationStatus; }

    public String getReasonDetails() { return reasonDetails; }
    public void setReasonDetails(String reasonDetails) { this.reasonDetails = reasonDetails; }

    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
