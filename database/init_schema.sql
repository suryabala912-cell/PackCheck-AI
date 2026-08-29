-- ====================================================================
-- PackCheck AI - Database Initialization Schema
-- SIH 2026 Problem Statement: SIH26034
-- Legal Metrology (Packaged Commodities) Rules, 2011 Compliance System
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `packcheck_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `packcheck_db`;

-- 1. Users Table (RBAC Access Control)
DROP TABLE IF EXISTS `manual_review_logs`;
DROP TABLE IF EXISTS `rule_evaluation_results`;
DROP TABLE IF EXISTS `scan_extracted_declarations`;
DROP TABLE IF EXISTS `product_scans`;
DROP TABLE IF EXISTS `compliance_rules`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'ENFORCEMENT_OFFICER', 'SUPERVISOR') NOT NULL DEFAULT 'ENFORCEMENT_OFFICER',
    `jurisdiction_zone` VARCHAR(100) DEFAULT 'Zone-A',
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Versioned Compliance Rules Table
CREATE TABLE `compliance_rules` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `rule_code` VARCHAR(50) NOT NULL UNIQUE,
    `legal_reference` VARCHAR(100) NOT NULL,
    `rule_name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT,
    `applicability_condition` VARCHAR(255) NOT NULL DEFAULT 'ALWAYS',
    `source_document` VARCHAR(255) NOT NULL,
    `source_version` VARCHAR(50) NOT NULL DEFAULT 'v2026.1',
    `effective_from` DATE NOT NULL,
    `effective_to` DATE DEFAULT NULL,
    `severity` INT NOT NULL DEFAULT 2 COMMENT '1: Minor, 2: Moderate, 3: Severe',
    `is_mandatory` BOOLEAN NOT NULL DEFAULT TRUE,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Product Scans Table (Assessment Session)
CREATE TABLE `product_scans` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `scan_reference_number` VARCHAR(50) NOT NULL UNIQUE,
    `officer_id` BIGINT NOT NULL,
    `product_name` VARCHAR(150),
    `category` VARCHAR(50),
    `is_imported` BOOLEAN NOT NULL DEFAULT FALSE,
    `image_url` TEXT NOT NULL,
    `annotated_image_url` TEXT,
    `preliminary_assessment` ENUM('PRELIMINARY_COMPLIANT', 'POTENTIAL_VIOLATION', 'REQUIRES_MANUAL_REVIEW') NOT NULL DEFAULT 'REQUIRES_MANUAL_REVIEW',
    `review_status` ENUM('PENDING_REVIEW', 'UNDER_REVIEW', 'OFFICER_VERIFIED') NOT NULL DEFAULT 'PENDING_REVIEW',
    `ux_visual_score` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Visual completeness score (Non-legal)',
    `scan_timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_scans_user` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Extracted Declarations Table
CREATE TABLE `scan_extracted_declarations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `scan_id` BIGINT NOT NULL,
    `declaration_key` VARCHAR(50) NOT NULL COMMENT 'MANUFACTURER_ADDRESS, COMMODITY_NAME, NET_QUANTITY, MFG_DATE, MRP, UNIT_SALE_PRICE, CONSUMER_CARE, COUNTRY_OF_ORIGIN',
    `extracted_value` TEXT,
    `ocr_confidence` DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    `bounding_box_json` VARCHAR(255) COMMENT '[x, y, w, h]',
    `verified_value` TEXT,
    `verification_status` ENUM('UNVERIFIED', 'CONFIRMED', 'EDITED_BY_OFFICER') NOT NULL DEFAULT 'UNVERIFIED',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_declarations_scan` FOREIGN KEY (`scan_id`) REFERENCES `product_scans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Rule Evaluation Results Table (Per-rule outcome)
CREATE TABLE `rule_evaluation_results` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `scan_id` BIGINT NOT NULL,
    `rule_id` BIGINT NOT NULL,
    `rule_code` VARCHAR(50) NOT NULL,
    `declaration_key` VARCHAR(50) NOT NULL,
    `evaluation_status` ENUM('PASS', 'FAIL', 'NOT_APPLICABLE', 'MANUAL_REVIEW', 'NOT_DETECTED') NOT NULL,
    `reason_details` TEXT,
    `evaluated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rule_eval_scan` FOREIGN KEY (`scan_id`) REFERENCES `product_scans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rule_eval_rule` FOREIGN KEY (`rule_id`) REFERENCES `compliance_rules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Manual Review Logs Table (Audit Trail)
CREATE TABLE `manual_review_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `scan_id` BIGINT NOT NULL,
    `officer_id` BIGINT NOT NULL,
    `action_taken` VARCHAR(100) NOT NULL COMMENT 'CONFIRMED_VIOLATION, DISMISSED_VIOLATION, EDITED_DECLARATION, APPROVED_ASSESSMENT',
    `previous_status` ENUM('PENDING_REVIEW', 'UNDER_REVIEW', 'OFFICER_VERIFIED'),
    `new_status` ENUM('PENDING_REVIEW', 'UNDER_REVIEW', 'OFFICER_VERIFIED'),
    `officer_notes` TEXT,
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_review_logs_scan` FOREIGN KEY (`scan_id`) REFERENCES `product_scans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_logs_user` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexing for performance
CREATE INDEX `idx_scans_officer` ON `product_scans` (`officer_id`);
CREATE INDEX `idx_scans_status` ON `product_scans` (`preliminary_assessment`, `review_status`);
CREATE INDEX `idx_declarations_scan` ON `scan_extracted_declarations` (`scan_id`, `declaration_key`);
CREATE INDEX `idx_rule_eval_scan` ON `rule_evaluation_results` (`scan_id`, `evaluation_status`);
