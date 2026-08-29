package com.sih.packcheck.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_scans")
public class ProductScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scan_reference_number", nullable = false, unique = true, length = 50)
    private String scanReferenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(name = "product_name", length = 150)
    private String productName;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "is_imported", nullable = false)
    private boolean isImported = false;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "annotated_image_url", columnDefinition = "TEXT")
    private String annotatedImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "preliminary_assessment", nullable = false)
    private Assessment preliminaryAssessment = Assessment.REQUIRES_MANUAL_REVIEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", nullable = false)
    private ReviewStatus reviewStatus = ReviewStatus.PENDING_REVIEW;

    @Column(name = "ux_visual_score", precision = 5, scale = 2)
    private BigDecimal uxVisualScore = BigDecimal.ZERO;

    @Column(name = "scan_timestamp", nullable = false, updatable = false)
    private LocalDateTime scanTimestamp = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScanExtractedDeclaration> declarations = new ArrayList<>();

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RuleEvaluationResult> ruleEvaluations = new ArrayList<>();

    public enum Assessment {
        PRELIMINARY_COMPLIANT, POTENTIAL_VIOLATION, REQUIRES_MANUAL_REVIEW
    }

    public enum ReviewStatus {
        PENDING_REVIEW, UNDER_REVIEW, OFFICER_VERIFIED
    }

    public ProductScan() {}

    public ProductScan(String scanReferenceNumber, User officer, String imageUrl) {
        this.scanReferenceNumber = scanReferenceNumber;
        this.officer = officer;
        this.imageUrl = imageUrl;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addDeclaration(ScanExtractedDeclaration declaration) {
        declarations.add(declaration);
        declaration.setScan(this);
    }

    public void addRuleEvaluation(RuleEvaluationResult evaluation) {
        ruleEvaluations.add(evaluation);
        evaluation.setScan(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getScanReferenceNumber() { return scanReferenceNumber; }
    public void setScanReferenceNumber(String scanReferenceNumber) { this.scanReferenceNumber = scanReferenceNumber; }

    public User getOfficer() { return officer; }
    public void setOfficer(User officer) { this.officer = officer; }

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

    public Assessment getPreliminaryAssessment() { return preliminaryAssessment; }
    public void setPreliminaryAssessment(Assessment preliminaryAssessment) { this.preliminaryAssessment = preliminaryAssessment; }

    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(ReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }

    public BigDecimal getUxVisualScore() { return uxVisualScore; }
    public void setUxVisualScore(BigDecimal uxVisualScore) { this.uxVisualScore = uxVisualScore; }

    public LocalDateTime getScanTimestamp() { return scanTimestamp; }
    public void setScanTimestamp(LocalDateTime scanTimestamp) { this.scanTimestamp = scanTimestamp; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ScanExtractedDeclaration> getDeclarations() { return declarations; }
    public void setDeclarations(List<ScanExtractedDeclaration> declarations) { this.declarations = declarations; }

    public List<RuleEvaluationResult> getRuleEvaluations() { return ruleEvaluations; }
    public void setRuleEvaluations(List<RuleEvaluationResult> ruleEvaluations) { this.ruleEvaluations = ruleEvaluations; }
}
