# Architecture Specification: PackCheck AI
**SIH 2026 Problem Statement:** SIH26034 — Legal Metrology (Packaged Commodities) Rules, 2011 Compliance System

> [!IMPORTANT]
> **AI-Assisted Preliminary Assessment System**
> PackCheck AI is designed strictly as a preliminary assessment and decision-support system for Enforcement Officers and Supervisors. It provides OCR declaration extraction, evidence mapping, and versioned rule evaluation. Results require manual verification by an officer before any official enforcement notice is issued.

## System Topology & Micro-tier Communication
1. **Frontend Tier (Port 3000)**: React 18 + Vite + Tailwind CSS. Provides the Enforcement Officer Portal, interactive visual evidence bounding box viewer, and Manual Review Queue UI.
2. **Backend Tier (Port 8080)**: Java 17 + Spring Boot 3. Manages state, authentication, versioned rule execution, manual review logs, audit history, and PDF report compilation.
3. **AI / Vision Tier (Port 8000)**: Python 3.10 + FastAPI microservice. Performs OpenCV label preprocessing, EasyOCR / Tesseract text extraction, and bounding box JSON ratio generation.
4. **Database Tier (Port 3306)**: MySQL 8.x storing versioned compliance rules, scan history, OCR extractions, 5-state rule evaluation records, and officer review audit logs.

```
React (Port 3000) ──REST (JWT)──> Spring Boot (Port 8080) ──SQL──> MySQL (Port 3306)
                                         │
                                  REST (Multipart)
                                         │
                                         ▼
                             FastAPI AI Service (Port 8000)
```
