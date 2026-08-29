package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ScanResponseDto {

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

    @JsonProperty("preliminary_assessment")
    private String preliminaryAssessment;

    @JsonProperty("review_status")
    private String reviewStatus;

    @JsonProperty("ux_visual_score")
    private BigDecimal uxVisualScore;

    @JsonProperty("scan_timestamp")
    private LocalDateTime scanTimestamp;

    @JsonProperty("overall_ocr_confidence")
    private BigDecimal overallOcrConfidence;

    @JsonProperty("ocr_quality_status")
    private String ocrQualityStatus;

    private List<ExtractedDeclarationDto> declarations;

    @JsonProperty("rule_evaluations")
    private List<RuleEvaluationDto> ruleEvaluations;

    private String disclaimer;

    public ScanResponseDto() {}

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

    public String getPreliminaryAssessment() { return preliminaryAssessment; }
    public void setPreliminaryAssessment(String preliminaryAssessment) { this.preliminaryAssessment = preliminaryAssessment; }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public BigDecimal getUxVisualScore() { return uxVisualScore; }
    public void setUxVisualScore(BigDecimal uxVisualScore) { this.uxVisualScore = uxVisualScore; }

    public LocalDateTime getScanTimestamp() { return scanTimestamp; }
    public void setScanTimestamp(LocalDateTime scanTimestamp) { this.scanTimestamp = scanTimestamp; }

    public BigDecimal getOverallOcrConfidence() { return overallOcrConfidence; }
    public void setOverallOcrConfidence(BigDecimal overallOcrConfidence) { this.overallOcrConfidence = overallOcrConfidence; }

    public String getOcrQualityStatus() { return ocrQualityStatus; }
    public void setOcrQualityStatus(String ocrQualityStatus) { this.ocrQualityStatus = ocrQualityStatus; }

    public List<ExtractedDeclarationDto> getDeclarations() { return declarations; }
    public void setDeclarations(List<ExtractedDeclarationDto> declarations) { this.declarations = declarations; }

    public List<RuleEvaluationDto> getRuleEvaluations() { return ruleEvaluations; }
    public void setRuleEvaluations(List<RuleEvaluationDto> ruleEvaluations) { this.ruleEvaluations = ruleEvaluations; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
