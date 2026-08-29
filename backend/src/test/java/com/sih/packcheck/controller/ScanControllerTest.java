package com.sih.packcheck.controller;

import com.sih.packcheck.config.SecurityConfig;
import com.sih.packcheck.dto.ScanAnalysisRequest;
import com.sih.packcheck.dto.ScanResponseDto;
import com.sih.packcheck.service.ScanService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ScanController.class)
@Import(SecurityConfig.class)
public class ScanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScanService scanService;

    @Test
    public void testAnalyzeScanSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "label.jpg", "image/jpeg", "fake image bytes".getBytes()
        );

        ScanResponseDto mockResponse = new ScanResponseDto();
        mockResponse.setScanReferenceNumber("SCAN-12345678");
        mockResponse.setPreliminaryAssessment("REQUIRES_MANUAL_REVIEW");
        mockResponse.setReviewStatus("PENDING_REVIEW");

        Mockito.when(scanService.analyzeScan(any(), any(ScanAnalysisRequest.class)))
                .thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/v1/scans/analyze")
                        .file(file)
                        .param("product_name", "Test Powder")
                        .param("category", "Food")
                        .param("is_imported", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scan_reference_number").value("SCAN-12345678"))
                .andExpect(jsonPath("$.preliminary_assessment").value("REQUIRES_MANUAL_REVIEW"));
    }

    @Test
    public void testAnalyzeScanEmptyFileReturnsBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]
        );

        mockMvc.perform(multipart("/api/v1/scans/analyze").file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    public void testAnalyzeScanAiServiceErrorReturnsInternalServerError() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "label.jpg", "image/jpeg", "image bytes".getBytes()
        );

        Mockito.when(scanService.analyzeScan(any(), any(ScanAnalysisRequest.class)))
                .thenThrow(new RuntimeException("AI service (FastAPI) unavailable"));

        mockMvc.perform(multipart("/api/v1/scans/analyze").file(file))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Scan analysis failed: AI service (FastAPI) unavailable"));
    }
}
