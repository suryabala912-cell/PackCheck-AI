package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sih.packcheck.entity.User;

public class UserResponseDto {

    private Long id;

    @JsonProperty("full_name")
    private String fullName;

    private String email;
    private String role;

    @JsonProperty("jurisdiction_zone")
    private String jurisdictionZone;

    private boolean active;

    public UserResponseDto() {}

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole() != null ? user.getRole().name() : null;
        this.jurisdictionZone = user.getJurisdictionZone();
        this.active = user.isActive();
    }

    public UserResponseDto(Long id, String fullName, String email, String role, String jurisdictionZone, boolean active) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.jurisdictionZone = jurisdictionZone;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getJurisdictionZone() {
        return jurisdictionZone;
    }

    public void setJurisdictionZone(String jurisdictionZone) {
        this.jurisdictionZone = jurisdictionZone;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
