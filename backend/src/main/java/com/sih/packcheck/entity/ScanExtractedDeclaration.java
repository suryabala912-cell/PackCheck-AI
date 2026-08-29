package com.sih.packcheck.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_extracted_declarations")
public class ScanExtractedDeclaration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private ProductScan scan;

    @Column(name = "declaration_key", nullable = false, length = 50)
    private String declarationKey;

    @Column(name = "extracted_value", columnDefinition = "TEXT")
    private String extractedValue;

    @Column(name = "ocr_confidence", nullable = false, precision = 5, scale = 4)
    private BigDecimal ocrConfidence = BigDecimal.ZERO;

    @Column(name = "bounding_box_json", length = 255)
    private String boundingBoxJson;

    @Column(name = "verified_value", columnDefinition = "TEXT")
    private String verifiedValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum VerificationStatus {
        UNVERIFIED, CONFIRMED, EDITED_BY_OFFICER
    }

    public ScanExtractedDeclaration() {}

    public ScanExtractedDeclaration(String declarationKey, String extractedValue, BigDecimal ocrConfidence, String boundingBoxJson) {
        this.declarationKey = declarationKey;
        this.extractedValue = extractedValue;
        this.ocrConfidence = ocrConfidence;
        this.boundingBoxJson = boundingBoxJson;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductScan getScan() { return scan; }
    public void setScan(ProductScan scan) { this.scan = scan; }

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

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
