package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.packcheck.entity.ProductScan;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ScanDetailDto {

    private Long id;

    @JsonProperty("scan_reference_number")
    private String scanReferenceNumber;

    @JsonProperty("product_name")
    private String productName;

    private String category;

    @JsonProperty("is_imported")
    private boolean isImported;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("annotated_image_url")
    private String annotatedImageUrl;

    @JsonProperty("preliminary_assessment")
    private String preliminaryAssessment;

    @JsonProperty("review_status")
    private String reviewStatus;

    @JsonProperty("ux_visual_score")
    private BigDecimal uxVisualScore;

    @JsonProperty("scan_timestamp")
    private LocalDateTime scanTimestamp;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    private UserResponseDto officer;

    private List<ScanExtractedDeclarationDto> declarations = new ArrayList<>();

    @JsonProperty("rule_evaluations")
    private List<RuleEvaluationResultDto> ruleEvaluations = new ArrayList<>();

    @JsonProperty("manual_review_logs")
    private List<ManualReviewLogDto> manualReviewLogs = new ArrayList<>();

    private String disclaimer = "Preliminary AI Assessment — Requires Officer Verification under Legal Metrology Rules, 2011.";

    public ScanDetailDto() {}

    public ScanDetailDto(ProductScan scan, List<ManualReviewLogDto> reviewLogs) {
        this.id = scan.getId();
        this.scanReferenceNumber = scan.getScanReferenceNumber();
        this.productName = scan.getProductName();
        this.category = scan.getCategory();
        this.isImported = scan.isImported();
        this.imageUrl = scan.getImageUrl();
        this.annotatedImageUrl = scan.getAnnotatedImageUrl();
        this.preliminaryAssessment = scan.getPreliminaryAssessment() != null ? scan.getPreliminaryAssessment().name() : null;
        this.reviewStatus = scan.getReviewStatus() != null ? scan.getReviewStatus().name() : null;
        this.uxVisualScore = scan.getUxVisualScore();
        this.scanTimestamp = scan.getScanTimestamp();
        this.updatedAt = scan.getUpdatedAt();

        if (scan.getOfficer() != null) {
            this.officer = new UserResponseDto(scan.getOfficer());
        }

        if (scan.getDeclarations() != null) {
            this.declarations = scan.getDeclarations().stream()
                    .map(ScanExtractedDeclarationDto::new)
                    .toList();
        }

        if (scan.getRuleEvaluations() != null) {
            this.ruleEvaluations = scan.getRuleEvaluations().stream()
                    .map(RuleEvaluationResultDto::new)
                    .toList();
        }

        if (reviewLogs != null) {
            this.manualReviewLogs = reviewLogs;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getScanReferenceNumber() { return scanReferenceNumber; }
    public void setScanReferenceNumber(String scanReferenceNumber) { this.scanReferenceNumber = scanReferenceNumber; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isImported() { return isImported; }
    public void setImported(boolean imported) { isImported = imported; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAnnotatedImageUrl() { return annotatedImageUrl; }
    public void setAnnotatedImageUrl(String annotatedImageUrl) { this.annotatedImageUrl = annotatedImageUrl; }

    public String getPreliminaryAssessment() { return preliminaryAssessment; }
    public void setPreliminaryAssessment(String preliminaryAssessment) { this.preliminaryAssessment = preliminaryAssessment; }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public BigDecimal getUxVisualScore() { return uxVisualScore; }
    public void setUxVisualScore(BigDecimal uxVisualScore) { this.uxVisualScore = uxVisualScore; }

    public LocalDateTime getScanTimestamp() { return scanTimestamp; }
    public void setScanTimestamp(LocalDateTime scanTimestamp) { this.scanTimestamp = scanTimestamp; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UserResponseDto getOfficer() { return officer; }
    public void setOfficer(UserResponseDto officer) { this.officer = officer; }

    public List<ScanExtractedDeclarationDto> getDeclarations() { return declarations; }
    public void setDeclarations(List<ScanExtractedDeclarationDto> declarations) { this.declarations = declarations; }

    public List<RuleEvaluationResultDto> getRuleEvaluations() { return ruleEvaluations; }
    public void setRuleEvaluations(List<RuleEvaluationResultDto> ruleEvaluations) { this.ruleEvaluations = ruleEvaluations; }

    public List<ManualReviewLogDto> getManualReviewLogs() { return manualReviewLogs; }
    public void setManualReviewLogs(List<ManualReviewLogDto> manualReviewLogs) { this.manualReviewLogs = manualReviewLogs; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
