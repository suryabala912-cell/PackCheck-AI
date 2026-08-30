# PackCheck AI — SIH 2026 (Problem Statement SIH26034)

> **Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.**

PackCheck AI is an **AI-assisted preliminary compliance assessment system** designed for Legal Metrology Enforcement Officers and Supervisors. It extracts packaged commodity label declarations using OCR, evaluates versioned Legal Metrology rule compliance, highlights evidence via interactive bounding boxes, and provides a manual review workflow for preliminary reporting.

---

## System Architecture & Ports

| Micro-tier Component | Technology | Default Port | Health Endpoint |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React 18 + Vite + Tailwind CSS | `3000` | `http://localhost:3000` |
| **Backend Domain** | Java 17 + Spring Boot 3 + JPA | `8080` | `http://localhost:8080/api/v1/health` |
| **AI Vision Service** | Python 3.10 + FastAPI + OpenCV | `8000` | `http://localhost:8000/health` |
| **Database** | MySQL 8.x | `3306` | `packcheck_db` |

---

## Directory Structure

```
PROJECT-SIH/
├── frontend/             # React + Vite + Tailwind CSS User Interface (Dockerfile included)
├── backend/              # Spring Boot 3 REST API & Versioned Rule Engine (Dockerfile included)
├── ai-services/          # Python FastAPI OCR & Extraction Microservice (Dockerfile included)
├── database/             # Versioned MySQL Initialization SQL Scripts
├── docs/                 # System Architecture, Database, API, Test & Dev Guides
├── docker-compose.yml    # One-command full-stack container deployment
├── .env.example          # Environment Configuration Blueprint
├── README.md             # Project Overview & Setup Guide
└── implementation_plan.md# Approved SIH Architectural Specification
```

---

## 🚀 One-Command Docker Deployment

Deploy the complete multi-container stack (Database, AI Vision Service, Spring Backend, and Frontend):

```bash
docker-compose up --build -d
```

Access services:
- **Frontend Dashboard**: http://localhost:3000
- **Spring Boot REST API**: http://localhost:8080/api/v1/health
- **AI OCR Microservice**: http://localhost:8000/health
- **MySQL Database**: `localhost:3306` (Database: `packcheck_db`)

To stop all services:
```bash
docker-compose down
```

---

## Quick Start (Manual Local Run Commands)

### 1. Database Setup
```bash
mysql -u root -p < database/init_schema.sql
```

### 2. Run AI Microservice (Port 8000)
```bash
cd ai-services
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Run Spring Boot Backend (Port 8080)
```bash
cd backend
mvn spring-boot:run
```

### 4. Run React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Prototype Authentication & Role-Based Access Control (RBAC)

PackCheck AI integrates a Spring Security + JWT prototype authentication system enforcing Role-Based Access Control (RBAC).

### Supported Roles
1. `ENFORCEMENT_OFFICER`: Initiate product scan analyses, view scans & histories, perform review actions.
2. `SUPERVISOR`: View scans, audit officer compliance assessments, access supervisor review reports.
3. `ADMIN`: System administration, compliance rule configuration, user role management.

### Prototype Demo Credentials
When `app.demo-users.enabled=true` (default), the system automatically seeds three demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **ENFORCEMENT_OFFICER** | `officer@packcheck.ai` | `PackCheck@123` |
| **SUPERVISOR** | `supervisor@packcheck.ai` | `PackCheck@123` |
| **ADMIN** | `admin@packcheck.ai` | `PackCheck@123` |

> ⚠️ **Notice:** Demo credentials are provided strictly for local SIH prototype demonstration and testing. For staging or production deployments, set `APP_DEMO_USERS_ENABLED=false`.

### Authentication API
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "officer@packcheck.ai",
    "password": "PackCheck@123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "<JWT_BEARER_TOKEN>",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": 2,
      "full_name": "Demo Officer",
      "email": "officer@packcheck.ai",
      "role": "ENFORCEMENT_OFFICER",
      "jurisdiction_zone": "Zone-A",
      "active": true
    }
  }
  ```

### Configuration & Environment Options
- **JWT Secret**: Configure via environment variable `JWT_SECRET` (default `PackCheckPrototypeSecretKeyForJwtTokenGeneration2026!SIH26034`).
- **JWT Expiration**: Configure via `JWT_EXPIRATION_MS` (default `86400000` ms / 24 hours).
- **Disable Demo Users**: Set `APP_DEMO_USERS_ENABLED=false` or `app.demo-users.enabled=false`.
- **CORS Allowed Origins**: Set `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`.

---

## 📋 Review & History REST APIs

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/scans/analyze` | Officer/Supervisor/Admin | Upload product label image & run preliminary compliance scan |
| `GET` | `/api/v1/scans` | Officer/Supervisor/Admin | Fetch scan history summary list |
| `GET` | `/api/v1/scans/{scanReference}` | Officer/Supervisor/Admin | Retrieve complete scan details, OCR extractions & review audit logs |
| `GET` | `/api/v1/reviews` | Officer/Supervisor/Admin | Retrieve scans requiring manual review queue |
| `PUT` | `/api/v1/scans/{scanReference}/review` | Officer/Supervisor/Admin | Submit officer manual review decision & record audit log |

---

## Documentation Links
- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database-design.md)
- [API Specification](docs/api-design.md)
- [Development Guide](docs/development-guide.md)
- [Synthetic Test Plan](docs/test-plan.md)

---

## Legal & Compliance Scope Notice
PackCheck AI provides preliminary decision-support outputs. Results generated by this system do not constitute legally binding penalty notices or official certifications without human verification and sign-off by an authorized Legal Metrology officer.
