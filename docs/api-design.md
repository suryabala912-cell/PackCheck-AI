# API Specification & Protocol Design: PackCheck AI

## Base URLs
- **Backend Domain API**: `http://localhost:8080/api/v1`
- **AI Microservice API**: `http://localhost:8000`

## Endpoints

### 1. Health Endpoints
- `GET http://localhost:8080/api/v1/health`
  - Returns backend operational status & version.
- `GET http://localhost:8000/health`
  - Returns AI FastAPI microservice operational status & engine version.

### 2. Scan Analysis & Assessment Pipeline
- `POST /api/v1/scans/analyze`
  - **Request**: `multipart/form-data` (`file`: package image, `product_name`: string, `category`: string, `is_imported`: boolean).
  - **Response**: `scan_id`, `preliminary_assessment`, `extracted_declarations` array with OCR confidence and bounding box ratios, `rule_evaluations` array with 5-state outcomes.

### 3. Officer Manual Review Queue
- `GET /api/v1/review-queue`
  - Returns scans with `review_status = PENDING_REVIEW` or `preliminary_assessment = REQUIRES_MANUAL_REVIEW`.
- `POST /api/v1/scans/{id}/review-action`
  - **Request Payload**:
    ```json
    {
      "action_taken": "CONFIRMED_VIOLATION",
      "officer_notes": "Verified missing MRP tax declaration on package label.",
      "updated_declarations": [...]
    }
    ```

### 4. Preliminary Compliance Report PDF
- `GET /api/v1/scans/{id}/report/pdf`
  - Returns streamed PDF document titled **"AI-Assisted Preliminary Compliance Assessment Report"**.
