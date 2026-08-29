package com.sih.packcheck.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.Map;

public class ExtractedDeclarationDto {

    @JsonProperty("field_name")
    private String fieldName;

    @JsonProperty("extracted_value")
    private String extractedValue;

    @JsonProperty("confidence")
    private BigDecimal confidence = BigDecimal.ZERO;

    @JsonProperty("source_text")
    private String sourceText;

    @JsonProperty("bounding_box")
    private Map<String, Object> boundingBox;

    @JsonProperty("detection_status")
    private String detectionStatus;

    public ExtractedDeclarationDto() {}

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getExtractedValue() { return extractedValue; }
    public void setExtractedValue(String extractedValue) { this.extractedValue = extractedValue; }

    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }

    public String getSourceText() { return sourceText; }
    public void setSourceText(String sourceText) { this.sourceText = sourceText; }

    public Map<String, Object> getBoundingBox() { return boundingBox; }
    public void setBoundingBox(Map<String, Object> boundingBox) { this.boundingBox = boundingBox; }

    public String getDetectionStatus() { return detectionStatus; }
    public void setDetectionStatus(String detectionStatus) { this.detectionStatus = detectionStatus; }
}
