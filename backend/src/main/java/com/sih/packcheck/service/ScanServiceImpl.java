package com.sih.packcheck.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.packcheck.dto.*;
import com.sih.packcheck.entity.*;
import com.sih.packcheck.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ScanServiceImpl implements ScanService {

    private static final Logger logger = LoggerFactory.getLogger(ScanServiceImpl.class);

    private final AiExtractionService aiExtractionService;
    private final ProductScanRepository productScanRepository;
    private final ScanExtractedDeclarationRepository declarationRepository;
    private final RuleEvaluationResultRepository ruleEvaluationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir = "uploads";

    public ScanServiceImpl(
            AiExtractionService aiExtractionService,
            ProductScanRepository productScanRepository,
            ScanExtractedDeclarationRepository declarationRepository,
            RuleEvaluationResultRepository ruleEvaluationRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.aiExtractionService = aiExtractionService;
        this.productScanRepository = productScanRepository;
        this.declarationRepository = declarationRepository;
        this.ruleEvaluationRepository = ruleEvaluationRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public ScanResponseDto analyzeScan(MultipartFile file, ScanAnalysisRequest request) {
        logger.info("Starting scan analysis workflow for file: {}", file.getOriginalFilename());

        // 1. Validate File Upload
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded image file cannot be empty.");
        }
        
        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid file type. Uploaded file must be an image.");
        }

        // 2. Save Image File Locally
        String savedFileName = saveImageFile(file);
        String relativeImageUrl = "/uploads/" + savedFileName;

        // 3. Call FastAPI AI Service
        AiExtractionResponseDto aiResponse = aiExtractionService.extractDeclarations(file);

        // 4. Ensure Officer User Exists
        User officer = userRepository.findById(request.getOfficerId())
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseGet(() -> {
                    User defaultOfficer = new User("Enforcement Officer", "officer@legalmetrology.gov.in", "hash", User.Role.ENFORCEMENT_OFFICER, "Zone-A");
                    return userRepository.save(defaultOfficer);
                }));

        // 5. Create ProductScan Entity
        String scanRefNo = "SCAN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ProductScan scan = new ProductScan(scanRefNo, officer, relativeImageUrl);
        scan.setProductName(request.getProductName() != null ? request.getProductName() : "Packaged Commodity");
        scan.setCategory(request.getCategory() != null ? request.getCategory() : "Retail Goods");
        scan.setImported(request.getIsImported());

        // Map AI Assessment Overall Status
        if (aiResponse.getComplianceReport() != null) {
            String overallStatus = aiResponse.getComplianceReport().getOverallStatus();
            if ("NON_COMPLIANT".equalsIgnoreCase(overallStatus)) {
                scan.setPreliminaryAssessment(ProductScan.Assessment.POTENTIAL_VIOLATION);
            } else if ("COMPLIANT".equalsIgnoreCase(overallStatus)) {
                scan.setPreliminaryAssessment(ProductScan.Assessment.PRELIMINARY_COMPLIANT);
            } else {
                scan.setPreliminaryAssessment(ProductScan.Assessment.REQUIRES_MANUAL_REVIEW);
            }
        }
        scan.setReviewStatus(ProductScan.ReviewStatus.PENDING_REVIEW);

        // 6. Map Extracted Declarations
        if (aiResponse.getDeclarations() != null) {
            for (ExtractedDeclarationDto dDto : aiResponse.getDeclarations()) {
                String bboxJson = null;
                if (dDto.getBoundingBox() != null) {
                    try {
                        bboxJson = objectMapper.writeValueAsString(dDto.getBoundingBox());
                    } catch (Exception e) {
                        logger.warn("Could not serialize bounding box for field {}", dDto.getFieldName());
                    }
                }

                ScanExtractedDeclaration declEntity = new ScanExtractedDeclaration(
                        dDto.getFieldName(),
                        dDto.getExtractedValue(),
                        dDto.getConfidence() != null ? dDto.getConfidence() : BigDecimal.ZERO,
                        bboxJson
                );
                scan.addDeclaration(declEntity);
            }
        }

        // 7. Map Rule Evaluation Results (Preserve UNVERIFIED/NEEDS_HUMAN_REVIEW safety constraint)
        if (aiResponse.getComplianceReport() != null && aiResponse.getComplianceReport().getRuleResults() != null) {
            for (RuleEvaluationDto rDto : aiResponse.getComplianceReport().getRuleResults()) {
                RuleEvaluationResult.Status dbStatus;
                String evalStatusStr = rDto.getEvaluationStatus();

                if ("FAIL".equalsIgnoreCase(evalStatusStr)) {
                    dbStatus = RuleEvaluationResult.Status.FAIL;
                } else if ("NOT_APPLICABLE".equalsIgnoreCase(evalStatusStr)) {
                    dbStatus = RuleEvaluationResult.Status.NOT_APPLICABLE;
                } else if ("PASS".equalsIgnoreCase(evalStatusStr)) {
                    dbStatus = RuleEvaluationResult.Status.PASS;
                } else {
                    // UNVERIFIED or REVIEW rules map safely to MANUAL_REVIEW in database
                    dbStatus = RuleEvaluationResult.Status.MANUAL_REVIEW;
                }

                RuleEvaluationResult rEntity = new RuleEvaluationResult(
                        rDto.getRuleCode(),
                        rDto.getRuleCode(), // Field key alignment
                        dbStatus,
                        rDto.getMessage()
                );
                scan.addRuleEvaluation(rEntity);
            }
        }

        // 8. Persist to Database
        ProductScan savedScan = productScanRepository.save(scan);
        logger.info("Persisted product scan ID {} with reference {}", savedScan.getId(), savedScan.getScanReferenceNumber());

        // 9. Build and Return ScanResponseDto
        return buildScanResponseDto(savedScan, aiResponse);
    }

    private String saveImageFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileExt = "jpg";
            String origName = file.getOriginalFilename();
            if (origName != null && origName.contains(".")) {
                fileExt = origName.substring(origName.lastIndexOf(".") + 1);
            }
            String fileName = UUID.randomUUID().toString() + "." + fileExt;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            logger.error("Could not save image file to upload directory", e);
            throw new RuntimeException("Failed to store image file.", e);
        }
    }

    private ScanResponseDto buildScanResponseDto(ProductScan scan, AiExtractionResponseDto aiResponse) {
        ScanResponseDto response = new ScanResponseDto();
        response.setId(scan.getId());
        response.setScanReferenceNumber(scan.getScanReferenceNumber());
        response.setProductName(scan.getProductName());
        response.setCategory(scan.getCategory());
        response.setImported(scan.isImported());
        response.setImageUrl(scan.getImageUrl());
        response.setPreliminaryAssessment(scan.getPreliminaryAssessment().name());
        response.setReviewStatus(scan.getReviewStatus().name());
        response.setUxVisualScore(scan.getUxVisualScore());
        response.setScanTimestamp(scan.getScanTimestamp());
        response.setOverallOcrConfidence(aiResponse.getOverallOcrConfidence());
        response.setOcrQualityStatus(aiResponse.getOcrQualityStatus());
        response.setDeclarations(aiResponse.getDeclarations());

        if (aiResponse.getComplianceReport() != null) {
            response.setRuleEvaluations(aiResponse.getComplianceReport().getRuleResults());
            response.setDisclaimer(aiResponse.getComplianceReport().getDisclaimer());
        }

        return response;
    }
}
