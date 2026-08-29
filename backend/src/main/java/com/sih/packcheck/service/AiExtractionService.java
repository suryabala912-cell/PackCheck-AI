package com.sih.packcheck.service;

import com.sih.packcheck.dto.AiExtractionResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AiExtractionService {
    AiExtractionResponseDto extractDeclarations(MultipartFile file);
}
