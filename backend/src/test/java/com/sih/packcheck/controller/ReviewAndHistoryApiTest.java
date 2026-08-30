package com.sih.packcheck.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.packcheck.dto.ReviewRequestDto;
import com.sih.packcheck.entity.ManualReviewLog;
import com.sih.packcheck.entity.ProductScan;
import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.ManualReviewLogRepository;
import com.sih.packcheck.repository.ProductScanRepository;
import com.sih.packcheck.repository.UserRepository;
import com.sih.packcheck.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ReviewAndHistoryApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductScanRepository productScanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ManualReviewLogRepository manualReviewLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User officerUser;
    private String officerJwtToken;
    private ProductScan testScan;

    @BeforeEach
    public void setUp() {
        manualReviewLogRepository.deleteAll();
        productScanRepository.deleteAll();
        userRepository.deleteAll();

        officerUser = new User("Officer Test", "officer@packcheck.ai", passwordEncoder.encode("PackCheck@123"), User.Role.ENFORCEMENT_OFFICER, "Zone-A");
        officerUser = userRepository.save(officerUser);
        officerJwtToken = jwtService.generateToken(officerUser);

        testScan = new ProductScan("SCAN-TEST1234", officerUser, "/uploads/test.jpg");
        testScan.setProductName("Sample Flour Pack");
        testScan.setCategory("Grocery");
        testScan.setPreliminaryAssessment(ProductScan.Assessment.REQUIRES_MANUAL_REVIEW);
        testScan.setReviewStatus(ProductScan.ReviewStatus.PENDING_REVIEW);
        testScan = productScanRepository.save(testScan);
    }

    @Test
    public void testGetScanHistoryUnauthorizedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/scans"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is("UNAUTHORIZED")));
    }

    @Test
    public void testGetScanHistorySuccess() throws Exception {
        mockMvc.perform(get("/api/v1/scans")
                        .header("Authorization", "Bearer " + officerJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].scan_reference_number", is("SCAN-TEST1234")))
                .andExpect(jsonPath("$[0].officer.email", is("officer@packcheck.ai")))
                .andExpect(jsonPath("$[0].officer.password").doesNotExist());
    }

    @Test
    public void testGetScanDetailsSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/scans/SCAN-TEST1234")
                        .header("Authorization", "Bearer " + officerJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scan_reference_number", is("SCAN-TEST1234")))
                .andExpect(jsonPath("$.product_name", is("Sample Flour Pack")))
                .andExpect(jsonPath("$.preliminary_assessment", is("REQUIRES_MANUAL_REVIEW")))
                .andExpect(jsonPath("$.review_status", is("PENDING_REVIEW")));
    }

    @Test
    public void testGetScanDetailsNotFoundReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/scans/SCAN-NONEXISTENT")
                        .header("Authorization", "Bearer " + officerJwtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", containsString("Scan not found")));
    }

    @Test
    public void testGetReviewQueueSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/reviews")
                        .header("Authorization", "Bearer " + officerJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].review_status", is("PENDING_REVIEW")));
    }

    @Test
    public void testPutManualReviewUnauthorizedReturns401() throws Exception {
        ReviewRequestDto request = new ReviewRequestDto("OFFICER_VERIFIED", "CONFIRMED_VIOLATION", "Missing net quantity declaration.");

        mockMvc.perform(put("/api/v1/scans/SCAN-TEST1234/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testPutManualReviewInvalidRequestReturns400() throws Exception {
        ReviewRequestDto invalidRequest = new ReviewRequestDto("", "CONFIRMED_VIOLATION", "Invalid payload test");

        mockMvc.perform(put("/api/v1/scans/SCAN-TEST1234/review")
                        .header("Authorization", "Bearer " + officerJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Review status 'new_status' is required.")));
    }

    @Test
    public void testPutManualReviewSuccessAndAuditLogCreated() throws Exception {
        ReviewRequestDto request = new ReviewRequestDto("OFFICER_VERIFIED", "CONFIRMED_VIOLATION", "Net weight missing unit declaration.");

        mockMvc.perform(put("/api/v1/scans/SCAN-TEST1234/review")
                        .header("Authorization", "Bearer " + officerJwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.review_status", is("OFFICER_VERIFIED")))
                .andExpect(jsonPath("$.preliminary_assessment", is("REQUIRES_MANUAL_REVIEW"))) // AI assessment remains untouched!
                .andExpect(jsonPath("$.manual_review_logs", hasSize(1)))
                .andExpect(jsonPath("$.manual_review_logs[0].action_taken", is("CONFIRMED_VIOLATION")))
                .andExpect(jsonPath("$.manual_review_logs[0].previous_status", is("PENDING_REVIEW")))
                .andExpect(jsonPath("$.manual_review_logs[0].new_status", is("OFFICER_VERIFIED")))
                .andExpect(jsonPath("$.manual_review_logs[0].officer_notes", is("Net weight missing unit declaration.")));

        // Verify database state directly
        ProductScan updatedDbScan = productScanRepository.findByScanReferenceNumber("SCAN-TEST1234").orElseThrow();
        assertEquals(ProductScan.ReviewStatus.OFFICER_VERIFIED, updatedDbScan.getReviewStatus());
        assertEquals(ProductScan.Assessment.REQUIRES_MANUAL_REVIEW, updatedDbScan.getPreliminaryAssessment());

        List<ManualReviewLog> logs = manualReviewLogRepository.findByScanId(updatedDbScan.getId());
        assertEquals(1, logs.size());
        assertEquals("CONFIRMED_VIOLATION", logs.get(0).getActionTaken());
        assertEquals(officerUser.getId(), logs.get(0).getOfficer().getId());
    }
}
