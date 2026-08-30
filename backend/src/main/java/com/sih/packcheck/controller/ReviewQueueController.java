package com.sih.packcheck.controller;

import com.sih.packcheck.dto.ScanSummaryDto;
import com.sih.packcheck.service.ScanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewQueueController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewQueueController.class);

    private final ScanService scanService;

    public ReviewQueueController(ScanService scanService) {
        this.scanService = scanService;
    }

    @GetMapping
    public ResponseEntity<List<ScanSummaryDto>> getReviewQueue(
            @RequestParam(value = "status", required = false) String status) {
        logger.info("GET /api/v1/reviews request received with status filter: {}", status);
        List<ScanSummaryDto> queue = scanService.getReviewQueue(status);
        return ResponseEntity.ok(queue);
    }
}
