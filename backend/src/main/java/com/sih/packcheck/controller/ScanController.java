package com.sih.packcheck.controller;

import com.sih.packcheck.dto.ScanAnalysisRequest;
import com.sih.packcheck.dto.ScanResponseDto;
import com.sih.packcheck.service.ScanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/scans")
@CrossOrigin(origins = "*")
public class ScanController {

    private static final Logger logger = LoggerFactory.getLogger(ScanController.class);

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
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

        try {
            ScanAnalysisRequest request = new ScanAnalysisRequest(productName, category, isImported, officerId);
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
}
