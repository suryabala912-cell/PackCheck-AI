package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReviewRequestDto {

    @JsonProperty("new_status")
    private String newStatus;

    @JsonProperty("action_taken")
    private String actionTaken;

    @JsonProperty("officer_notes")
    private String officerNotes;

    public ReviewRequestDto() {}

    public ReviewRequestDto(String newStatus, String actionTaken, String officerNotes) {
        this.newStatus = newStatus;
        this.actionTaken = actionTaken;
        this.officerNotes = officerNotes;
    }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public String getOfficerNotes() { return officerNotes; }
    public void setOfficerNotes(String officerNotes) { this.officerNotes = officerNotes; }
}
