package com.sih.packcheck.repository;

import com.sih.packcheck.entity.ComplianceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplianceRuleRepository extends JpaRepository<ComplianceRule, Long> {
    Optional<ComplianceRule> findByRuleCode(String ruleCode);
}
