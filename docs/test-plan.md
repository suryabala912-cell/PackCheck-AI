# Synthetic Test Plan: PackCheck AI

## Synthetic Dataset Design
To ensure complete compliance with SIH rules and avoid using altered real commercial products during development, testing uses 5 synthetic mock package graphics:

| Synthetic Test Sample | Condition Tested | Expected Rule Outcome | Expected Assessment |
| :--- | :--- | :--- | :--- |
| `SYN_01_COMPLIANT` | All 7 mandatory declarations present with correct formatting. | All mandatory rules evaluate to `PASS`. | `PRELIMINARY_COMPLIANT` |
| `SYN_02_NO_TAX_MRP` | Package has MRP but omits "inclusive of all taxes". | `LM_RULE_05` evaluates to `FAIL`. | `POTENTIAL_VIOLATION` |
| `SYN_03_IMPORTED_NO_ORIGIN` | `is_imported = true` but Country of Origin missing. | `LM_RULE_07` evaluates to `FAIL`. | `POTENTIAL_VIOLATION` |
| `SYN_04_FUZZY_MFG_DATE` | OCR confidence on Mfg Date $< 0.65$. | `LM_RULE_04` evaluates to `MANUAL_REVIEW`. | `REQUIRES_MANUAL_REVIEW` |
| `SYN_05_DOMESTIC_PACK` | `is_imported = false` domestic spice packet. | `LM_RULE_07` evaluates to `NOT_APPLICABLE`. | `PRELIMINARY_COMPLIANT` |

## Test Verification Workflow
1. Run backend unit tests verifying `RuleEngineService` evaluation matrix.
2. Execute end-to-end API test verifying image submission, OCR parsing, 5-state rule evaluation, and PDF report creation.
