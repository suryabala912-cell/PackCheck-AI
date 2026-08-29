package com.sih.packcheck.repository;

import com.sih.packcheck.entity.ScanExtractedDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanExtractedDeclarationRepository extends JpaRepository<ScanExtractedDeclaration, Long> {
    List<ScanExtractedDeclaration> findByScanId(Long scanId);
}
