package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.packcheck.entity.ScanExtractedDeclaration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ScanExtractedDeclarationDto {

    private Long id;

    @JsonProperty("declaration_key")
    private String declarationKey;

    @JsonProperty("extracted_value")
    private String extractedValue;

    @JsonProperty("ocr_confidence")
    private BigDecimal ocrConfidence;

    @JsonProperty("bounding_box_json")
    private String boundingBoxJson;

    @JsonProperty("verified_value")
    private String verifiedValue;

    @JsonProperty("verification_status")
    private String verificationStatus;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    public ScanExtractedDeclarationDto() {}

    public ScanExtractedDeclarationDto(ScanExtractedDeclaration declaration) {
        this.id = declaration.getId();
        this.declarationKey = declaration.getDeclarationKey();
        this.extractedValue = declaration.getExtractedValue();
        this.ocrConfidence = declaration.getOcrConfidence();
        this.boundingBoxJson = declaration.getBoundingBoxJson();
        this.verifiedValue = declaration.getVerifiedValue();
        this.verificationStatus = declaration.getVerificationStatus() != null ? declaration.getVerificationStatus().name() : null;
        this.createdAt = declaration.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeclarationKey() { return declarationKey; }
    public void setDeclarationKey(String declarationKey) { this.declarationKey = declarationKey; }

    public String getExtractedValue() { return extractedValue; }
    public void setExtractedValue(String extractedValue) { this.extractedValue = extractedValue; }

    public BigDecimal getOcrConfidence() { return ocrConfidence; }
    public void setOcrConfidence(BigDecimal ocrConfidence) { this.ocrConfidence = ocrConfidence; }

    public String getBoundingBoxJson() { return boundingBoxJson; }
    public void setBoundingBoxJson(String boundingBoxJson) { this.boundingBoxJson = boundingBoxJson; }

    public String getVerifiedValue() { return verifiedValue; }
    public void setVerifiedValue(String verifiedValue) { this.verifiedValue = verifiedValue; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
