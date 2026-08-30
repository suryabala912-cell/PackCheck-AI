package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.packcheck.entity.ProductScan;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ScanSummaryDto {

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

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    private UserResponseDto officer;

    public ScanSummaryDto() {}

    public ScanSummaryDto(ProductScan scan) {
        this.id = scan.getId();
        this.scanReferenceNumber = scan.getScanReferenceNumber();
        this.productName = scan.getProductName();
        this.category = scan.getCategory();
        this.isImported = scan.isImported();
        this.imageUrl = scan.getImageUrl();
        this.preliminaryAssessment = scan.getPreliminaryAssessment() != null ? scan.getPreliminaryAssessment().name() : null;
        this.reviewStatus = scan.getReviewStatus() != null ? scan.getReviewStatus().name() : null;
        this.uxVisualScore = scan.getUxVisualScore();
        this.scanTimestamp = scan.getScanTimestamp();
        this.updatedAt = scan.getUpdatedAt();
        if (scan.getOfficer() != null) {
            this.officer = new UserResponseDto(scan.getOfficer());
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
}
