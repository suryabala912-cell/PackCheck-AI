package com.sih.packcheck.repository;

import com.sih.packcheck.entity.ManualReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManualReviewLogRepository extends JpaRepository<ManualReviewLog, Long> {
    List<ManualReviewLog> findByScanId(Long scanId);
}
