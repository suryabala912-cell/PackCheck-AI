# Development Guide & Local Setup Instructions

This guide provides step-by-step instructions to set up and run PackCheck AI locally for SIH development.

## 1. Prerequisites
- **Node.js**: v18.x or higher (v24.x tested)
- **Java JDK**: Java 17 or higher (Java 24 tested)
- **Python**: v3.10 or higher
- **MySQL Server**: v8.0 or higher

---

## 2. Running Services Locally

### A. Database Setup (MySQL)
1. Ensure MySQL server is running on port `3306`.
2. Import schema:
   ```bash
   mysql -u root -p < database/init_schema.sql
   ```

### B. Frontend (React + Vite)
1. Open terminal in `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server (Port 3000):
   ```bash
   npm run dev
   ```

### C. Backend (Spring Boot 3)
1. Open terminal in `backend/` directory.
2. Build and run backend (Port 8080):
   ```bash
   mvn spring-boot:run
   ```

### D. AI Microservice (Python FastAPI)
1. Open terminal in `ai-services/` directory.
2. Create python virtual environment & install requirements:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Start FastAPI server (Port 8000):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

## 3. Verifying Local Health Checks
- **Frontend**: Open `http://localhost:3000` in browser.
- **Backend Health**: `GET http://localhost:8080/api/v1/health`
- **AI Service Health**: `GET http://localhost:8000/health`
