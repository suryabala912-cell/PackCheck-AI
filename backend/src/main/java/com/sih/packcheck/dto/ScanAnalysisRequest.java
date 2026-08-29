package com.sih.packcheck.dto;

public class ScanAnalysisRequest {
    private String productName;
    private String category;
    private Boolean isImported = false;
    private Long officerId = 1L;

    public ScanAnalysisRequest() {}

    public ScanAnalysisRequest(String productName, String category, Boolean isImported, Long officerId) {
        this.productName = productName;
        this.category = category;
        this.isImported = isImported;
        this.officerId = officerId;
    }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getIsImported() { return isImported != null && isImported; }
    public void setIsImported(Boolean isImported) { this.isImported = isImported; }

    public Long getOfficerId() { return officerId != null ? officerId : 1L; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }
}
