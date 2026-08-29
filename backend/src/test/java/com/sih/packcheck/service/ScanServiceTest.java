package com.sih.packcheck.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.packcheck.dto.*;
import com.sih.packcheck.entity.ProductScan;
import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.ProductScanRepository;
import com.sih.packcheck.repository.RuleEvaluationResultRepository;
import com.sih.packcheck.repository.ScanExtractedDeclarationRepository;
import com.sih.packcheck.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class ScanServiceTest {

    @Mock
    private AiExtractionService aiExtractionService;

    @Mock
    private ProductScanRepository productScanRepository;

    @Mock
    private ScanExtractedDeclarationRepository declarationRepository;

    @Mock
    private RuleEvaluationResultRepository ruleEvaluationRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ScanServiceImpl scanService;

    private User mockOfficer;

    @BeforeEach
    public void setUp() {
        org.springframework.test.util.ReflectionTestUtils.setField(scanService, "uploadDir", "target/test-uploads");
        mockOfficer = new User("Officer Test", "officer@test.gov.in", "hash", User.Role.ENFORCEMENT_OFFICER, "Zone-A");
        mockOfficer.setId(1L);
    }

    @Test
    public void testAnalyzeScanSuccess() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "label.jpg", "image/jpeg", "fake image bytes".getBytes()
        );

        AiExtractionResponseDto aiDto = new AiExtractionResponseDto();
        aiDto.setStatus("SUCCESS");
        aiDto.setOverallOcrConfidence(new BigDecimal("0.92"));
        aiDto.setOcrQualityStatus("HIGH_CONFIDENCE");

        ExtractedDeclarationDto decl = new ExtractedDeclarationDto();
        decl.setFieldName("NET_QUANTITY");
        decl.setExtractedValue("500 g");
        decl.setConfidence(new BigDecimal("0.95"));
        aiDto.setDeclarations(List.of(decl));

        AiExtractionResponseDto.ComplianceReportDto report = new AiExtractionResponseDto.ComplianceReportDto();
        report.setOverallStatus("NEEDS_HUMAN_OFFICER_REVIEW");
        report.setDisclaimer("PackCheck AI preliminary compliance assessment.");

        RuleEvaluationDto ruleEval = new RuleEvaluationDto();
        ruleEval.setRuleCode("LM_RULE_03");
        ruleEval.setEvaluationStatus("NOT_VERIFIED");
        ruleEval.setVerificationStatus("NOT_VERIFIED");
        ruleEval.setRequiresHumanReview(true);
        ruleEval.setMessage("Rule legal status is NOT_VERIFIED; human officer review required.");
        report.setRuleResults(List.of(ruleEval));

        aiDto.setComplianceReport(report);

        Mockito.when(aiExtractionService.extractDeclarations(any())).thenReturn(aiDto);
        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockOfficer));
        Mockito.when(productScanRepository.save(any(ProductScan.class))).thenAnswer(invocation -> {
            ProductScan ps = invocation.getArgument(0);
            ps.setId(100L);
            return ps;
        });

        ScanAnalysisRequest request = new ScanAnalysisRequest("Almonds", "Dry Fruits", false, 1L);
        ScanResponseDto response = scanService.analyzeScan(file, request);

        assertNotNull(response);
        assertEquals("Almonds", response.getProductName());
        assertEquals("REQUIRES_MANUAL_REVIEW", response.getPreliminaryAssessment());
        assertEquals("PENDING_REVIEW", response.getReviewStatus());
        assertEquals("PackCheck AI preliminary compliance assessment.", response.getDisclaimer());
        assertEquals(1, response.getDeclarations().size());
        assertEquals(1, response.getRuleEvaluations().size());
    }

    @Test
    public void testAnalyzeScanThrowsExceptionForEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);
        ScanAnalysisRequest request = new ScanAnalysisRequest();

        assertThrows(IllegalArgumentException.class, () -> scanService.analyzeScan(emptyFile, request));
    }
}
