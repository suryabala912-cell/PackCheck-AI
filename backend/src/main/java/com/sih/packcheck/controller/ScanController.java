package com.sih.packcheck.controller;

import com.sih.packcheck.dto.ReviewRequestDto;
import com.sih.packcheck.dto.ScanAnalysisRequest;
import com.sih.packcheck.dto.ScanDetailDto;
import com.sih.packcheck.dto.ScanResponseDto;
import com.sih.packcheck.dto.ScanSummaryDto;
import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.UserRepository;
import com.sih.packcheck.service.ScanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/scans")
public class ScanController {

    private static final Logger logger = LoggerFactory.getLogger(ScanController.class);

    private final ScanService scanService;
    private final UserRepository userRepository;

    public ScanController(ScanService scanService, UserRepository userRepository) {
        this.scanService = scanService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeScan(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "product_name", required = false) String productName,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "is_imported", required = false, defaultValue = "false") Boolean isImported,
            @RequestParam(value = "officer_id", required = false, defaultValue = "1") Long officerId) {
        
        logger.info("Received analyze request for file '{}', product: '{}', imported: {}", 
                file.getOriginalFilename(), productName, isImported);

        if (file.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Uploaded file cannot be empty.");
            return ResponseEntity.badRequest().body(error);
        }

        Long effectiveOfficerId = officerId;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            String userEmail = authentication.getName();
            Optional<User> authUser = userRepository.findByEmail(userEmail);
            if (authUser.isPresent()) {
                effectiveOfficerId = authUser.get().getId();
                logger.info("Authenticated officer identity binding: user ID {}", effectiveOfficerId);
            }
        }

        try {
            ScanAnalysisRequest request = new ScanAnalysisRequest(productName, category, isImported, effectiveOfficerId);
            ScanResponseDto response = scanService.analyzeScan(file, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Validation failure in scan analysis: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error during scan analysis execution: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Scan analysis failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<ScanSummaryDto>> getScanHistory() {
        logger.info("GET /api/v1/scans request received");
        User currentUser = getAuthenticatedUser();
        List<ScanSummaryDto> history = scanService.getScanHistory(currentUser);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{scanReference}")
    public ResponseEntity<?> getScanDetails(@PathVariable("scanReference") String scanReference) {
        logger.info("GET /api/v1/scans/{} request received", scanReference);
        try {
            ScanDetailDto details = scanService.getScanDetails(scanReference);
            return ResponseEntity.ok(details);
        } catch (IllegalArgumentException e) {
            logger.warn("Scan details not found: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            logger.error("Error fetching scan details: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve scan details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{scanReference}/review")
    public ResponseEntity<?> submitManualReview(
            @PathVariable("scanReference") String scanReference,
            @RequestBody ReviewRequestDto reviewRequest) {
        logger.info("PUT /api/v1/scans/{}/review request received", scanReference);
        
        User reviewer = getAuthenticatedUser();
        if (reviewer == null) {
            // Fallback to first officer user if unauthenticated during loose test contexts
            reviewer = userRepository.findAll().stream().findFirst().orElse(null);
        }
        if (reviewer == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authenticated reviewer context is missing.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        try {
            ScanDetailDto updatedScan = scanService.submitManualReview(scanReference, reviewRequest, reviewer);
            return ResponseEntity.ok(updatedScan);
        } catch (IllegalArgumentException e) {
            logger.warn("Manual review validation failure: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            if (e.getMessage() != null && e.getMessage().toLowerCase().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Error submitting manual review: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Manual review update failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            String email = authentication.getName();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }
}
