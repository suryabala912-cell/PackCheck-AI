package com.sih.packcheck.service;

import com.sih.packcheck.dto.*;
import com.sih.packcheck.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ScanService {
    ScanResponseDto analyzeScan(MultipartFile file, ScanAnalysisRequest request);
    List<ScanSummaryDto> getScanHistory(User currentUser);
    ScanDetailDto getScanDetails(String scanReferenceNumber);
    List<ScanSummaryDto> getReviewQueue(String statusFilter);
    ScanDetailDto submitManualReview(String scanReferenceNumber, ReviewRequestDto reviewRequest, User reviewer);
}
