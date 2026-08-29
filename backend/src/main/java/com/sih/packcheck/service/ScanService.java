package com.sih.packcheck.service;

import com.sih.packcheck.dto.ScanAnalysisRequest;
import com.sih.packcheck.dto.ScanResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface ScanService {
    ScanResponseDto analyzeScan(MultipartFile file, ScanAnalysisRequest request);
}
