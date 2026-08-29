package com.sih.packcheck.service;

import com.sih.packcheck.dto.AiExtractionResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class AiExtractionServiceImpl implements AiExtractionService {

    private static final Logger logger = LoggerFactory.getLogger(AiExtractionServiceImpl.class);

    private final RestClient restClient;

    public AiExtractionServiceImpl(@Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 seconds
        factory.setReadTimeout(30000);     // 30 seconds for OCR processing

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(factory)
                .build();
        
        logger.info("AiExtractionServiceImpl initialized with base URL: {}", aiServiceUrl);
    }

    @Override
    public AiExtractionResponseDto extractDeclarations(MultipartFile file) {
        logger.info("Sending image '{}' ({} bytes) to FastAPI AI service...", file.getOriginalFilename(), file.getSize());

        try {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "label.jpg";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            AiExtractionResponseDto response = restClient.post()
                    .uri("/api/v1/extract")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(AiExtractionResponseDto.class);

            if (response != null) {
                logger.info("Received AI extraction response. Quality: {}, Status: {}", 
                        response.getOcrQualityStatus(), response.getStatus());
                return response;
            } else {
                throw new RuntimeException("Empty response received from AI extraction service.");
            }

        } catch (IOException e) {
            logger.error("Failed to read uploaded file bytes for AI service payload", e);
            throw new RuntimeException("Failed to read image file data for OCR extraction.", e);
        } catch (Exception e) {
            logger.error("AI service execution error or timeout: {}", e.getMessage(), e);
            throw new RuntimeException("AI service (FastAPI) unavailable or encountered error: " + e.getMessage(), e);
        }
    }
}
