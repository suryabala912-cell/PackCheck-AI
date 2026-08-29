package com.sih.packcheck.repository;

import com.sih.packcheck.entity.ProductScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductScanRepository extends JpaRepository<ProductScan, Long> {
    Optional<ProductScan> findByScanReferenceNumber(String scanReferenceNumber);
    List<ProductScan> findByReviewStatus(ProductScan.ReviewStatus reviewStatus);
    List<ProductScan> findByOfficerId(Long officerId);
}
