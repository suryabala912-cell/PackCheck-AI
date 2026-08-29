package com.sih.packcheck.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "manual_review_logs")
public class ManualReviewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private ProductScan scan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(name = "action_taken", nullable = false, length = 100)
    private String actionTaken;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private ProductScan.ReviewStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    private ProductScan.ReviewStatus newStatus;

    @Column(name = "officer_notes", columnDefinition = "TEXT")
    private String officerNotes;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public ManualReviewLog() {}

    public ManualReviewLog(ProductScan scan, User officer, String actionTaken, ProductScan.ReviewStatus previousStatus, ProductScan.ReviewStatus newStatus, String officerNotes) {
        this.scan = scan;
        this.officer = officer;
        this.actionTaken = actionTaken;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.officerNotes = officerNotes;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductScan getScan() { return scan; }
    public void setScan(ProductScan scan) { this.scan = scan; }

    public User getOfficer() { return officer; }
    public void setOfficer(User officer) { this.officer = officer; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public ProductScan.ReviewStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(ProductScan.ReviewStatus previousStatus) { this.previousStatus = previousStatus; }

    public ProductScan.ReviewStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ProductScan.ReviewStatus newStatus) { this.newStatus = newStatus; }

    public String getOfficerNotes() { return officerNotes; }
    public void setOfficerNotes(String officerNotes) { this.officerNotes = officerNotes; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
