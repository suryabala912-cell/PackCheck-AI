# Database Design: PackCheck AI

## Entity Definitions & Key Design Principles

### 1. Versioned Rule Engine Schema (`compliance_rules`)
Legal Metrology rules evolve through official government notifications. The `compliance_rules` table stores:
- `rule_code`: Unique identifier (e.g., `LM_RULE_01`).
- `legal_reference`: Statutory section (e.g., `Rule 6(1)(a)`).
- `source_document`: Official Dept of Consumer Affairs publication.
- `source_version`: Version tag (e.g., `v2026.1`).
- `effective_from` & `effective_to`: Date validity windows.
- `applicability_condition`: Logical condition for conditional evaluation (e.g. `is_imported == true`).

### 2. 5-State Rule Outcomes (`rule_evaluation_results`)
Rule evaluation outcomes are explicitly recorded as one of 5 statuses:
- `PASS`: Met statutory requirement.
- `FAIL`: Non-compliant wording or format.
- `NOT_APPLICABLE`: Rule not applicable based on packaging type or origin.
- `MANUAL_REVIEW`: OCR confidence below threshold or fuzzy detection.
- `NOT_DETECTED`: Mandatory declaration missing from scan.

### 3. Officer Verification & Audit Log (`manual_review_logs`)
Maintains an immutable record of officer review actions:
- `action_taken`: `CONFIRMED_VIOLATION`, `DISMISSED_VIOLATION`, `EDITED_DECLARATION`, `APPROVED_ASSESSMENT`.
- `officer_notes`: Mandatory rationale recorded by the inspecting officer.
