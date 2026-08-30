package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.packcheck.entity.ManualReviewLog;

import java.time.LocalDateTime;

public class ManualReviewLogDto {

    private Long id;

    @JsonProperty("action_taken")
    private String actionTaken;

    @JsonProperty("previous_status")
    private String previousStatus;

    @JsonProperty("new_status")
    private String newStatus;

    @JsonProperty("officer_notes")
    private String officerNotes;

    private LocalDateTime timestamp;

    private UserResponseDto officer;

    public ManualReviewLogDto() {}

    public ManualReviewLogDto(ManualReviewLog log) {
        this.id = log.getId();
        this.actionTaken = log.getActionTaken();
        this.previousStatus = log.getPreviousStatus() != null ? log.getPreviousStatus().name() : null;
        this.newStatus = log.getNewStatus() != null ? log.getNewStatus().name() : null;
        this.officerNotes = log.getOfficerNotes();
        this.timestamp = log.getTimestamp();
        if (log.getOfficer() != null) {
            this.officer = new UserResponseDto(log.getOfficer());
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getOfficerNotes() { return officerNotes; }
    public void setOfficerNotes(String officerNotes) { this.officerNotes = officerNotes; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public UserResponseDto getOfficer() { return officer; }
    public void setOfficer(UserResponseDto officer) { this.officer = officer; }
}
