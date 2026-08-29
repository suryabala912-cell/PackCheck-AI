# Database Setup Instructions: PackCheck AI

## Prerequisites
- MySQL Server 8.0 or higher running on port 3306.

## Schema Initialization
To create the database and all versioned tables, execute the `init_schema.sql` script via MySQL CLI or Workbench:

```bash
mysql -u root -p < init_schema.sql
```

Alternatively, from within MySQL Workbench or DBeaver, open `init_schema.sql` and execute the script.

## Core Schema Features
1. **Rule Versioning**: Table `compliance_rules` supports rule versioning (`source_version`, `effective_from`, `effective_to`, `source_document`).
2. **Multi-State Evaluation**: Table `rule_evaluation_results` supports explicit outcomes (`PASS`, `FAIL`, `NOT_APPLICABLE`, `MANUAL_REVIEW`, `NOT_DETECTED`).
3. **Audit Trail**: Table `manual_review_logs` tracks officer manual review overrides and signed off assessments.
