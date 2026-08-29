package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

public class AiExtractionResponseDto {

    private String status;
    private String filename;

    @JsonProperty("content_type")
    private String contentType;

    @JsonProperty("size_bytes")
    private Long sizeBytes;

    @JsonProperty("ocr_engine")
    private String ocrEngine;

    @JsonProperty("raw_text")
    private String rawText;

    @JsonProperty("normalized_text")
    private String normalizedText;

    @JsonProperty("overall_ocr_confidence")
    private BigDecimal overallOcrConfidence = BigDecimal.ZERO;

    @JsonProperty("ocr_quality_status")
    private String ocrQualityStatus;

    @JsonProperty("word_count")
    private Integer wordCount;

    private List<ExtractedDeclarationDto> declarations;

    @JsonProperty("compliance_report")
    private ComplianceReportDto complianceReport;

    private String message;
    private String timestamp;

    public AiExtractionResponseDto() {}

    public static class ComplianceReportDto {
        @JsonProperty("overall_status")
        private String overallStatus;

        @JsonProperty("verified_rules_count")
        private Integer verifiedRulesCount;

        @JsonProperty("unverified_rules_count")
        private Integer unverifiedRulesCount;

        @JsonProperty("passed_rules_count")
        private Integer passedRulesCount;

        @JsonProperty("failed_rules_count")
        private Integer failedRulesCount;

        @JsonProperty("review_required_rules_count")
        private Integer reviewRequiredRulesCount;

        @JsonProperty("rule_results")
        private List<RuleEvaluationDto> ruleResults;

        private String disclaimer;

        public ComplianceReportDto() {}

        public String getOverallStatus() { return overallStatus; }
        public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }

        public Integer getVerifiedRulesCount() { return verifiedRulesCount; }
        public void setVerifiedRulesCount(Integer verifiedRulesCount) { this.verifiedRulesCount = verifiedRulesCount; }

        public Integer getUnverifiedRulesCount() { return unverifiedRulesCount; }
        public void setUnverifiedRulesCount(Integer unverifiedRulesCount) { this.unverifiedRulesCount = unverifiedRulesCount; }

        public Integer getPassedRulesCount() { return passedRulesCount; }
        public void setPassedRulesCount(Integer passedRulesCount) { this.passedRulesCount = passedRulesCount; }

        public Integer getFailedRulesCount() { return failedRulesCount; }
        public void setFailedRulesCount(Integer failedRulesCount) { this.failedRulesCount = failedRulesCount; }

        public Integer getReviewRequiredRulesCount() { return reviewRequiredRulesCount; }
        public void setReviewRequiredRulesCount(Integer reviewRequiredRulesCount) { this.reviewRequiredRulesCount = reviewRequiredRulesCount; }

        public List<RuleEvaluationDto> getRuleResults() { return ruleResults; }
        public void setRuleResults(List<RuleEvaluationDto> ruleResults) { this.ruleResults = ruleResults; }

        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getOcrEngine() { return ocrEngine; }
    public void setOcrEngine(String ocrEngine) { this.ocrEngine = ocrEngine; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getNormalizedText() { return normalizedText; }
    public void setNormalizedText(String normalizedText) { this.normalizedText = normalizedText; }

    public BigDecimal getOverallOcrConfidence() { return overallOcrConfidence; }
    public void setOverallOcrConfidence(BigDecimal overallOcrConfidence) { this.overallOcrConfidence = overallOcrConfidence; }

    public String getOcrQualityStatus() { return ocrQualityStatus; }
    public void setOcrQualityStatus(String ocrQualityStatus) { this.ocrQualityStatus = ocrQualityStatus; }

    public Integer getWordCount() { return wordCount; }
    public void setWordCount(Integer wordCount) { this.wordCount = wordCount; }

    public List<ExtractedDeclarationDto> getDeclarations() { return declarations; }
    public void setDeclarations(List<ExtractedDeclarationDto> declarations) { this.declarations = declarations; }

    public ComplianceReportDto getComplianceReport() { return complianceReport; }
    public void setComplianceReport(ComplianceReportDto complianceReport) { this.complianceReport = complianceReport; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
