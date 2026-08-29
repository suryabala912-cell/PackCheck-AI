import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Cpu, Database, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

function App() {
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', details: null });
  const [aiHealth, setAiHealth] = useState({ status: 'checking', details: null });

  useEffect(() => {
    // Check Spring Boot Backend health
    axios.get('http://localhost:8080/api/v1/health')
      .then(res => setBackendHealth({ status: 'online', details: res.data }))
      .catch(err => setBackendHealth({ status: 'offline', details: err.message }));

    // Check Python FastAPI AI Service health
    axios.get('http://localhost:8000/health')
      .then(res => setAiHealth({ status: 'online', details: res.data }))
      .catch(err => setAiHealth({ status: 'offline', details: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 border-b border-slate-700 pb-6 mb-6">
          <ShieldCheck className="w-12 h-12 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">PackCheck AI</h1>
            <p className="text-slate-400 text-sm mt-1">
              SIH 2026 Problem Statement SIH26034 — Legal Metrology Compliance (Phase 1 Skeleton)
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 text-amber-300 text-sm">
          <strong>Notice:</strong> Phase 1 System Initialization complete. Services health indicators below.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Frontend Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-slate-400">Frontend UI</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">React + Vite</div>
            <div className="text-xs text-slate-400 font-mono">Port 3000 (Active)</div>
          </div>

          {/* Backend Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-slate-400">Backend Domain</span>
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">Spring Boot 3</div>
            <div className="text-xs font-mono">
              Status: <span className={backendHealth.status === 'online' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{backendHealth.status}</span> (Port 8080)
            </div>
          </div>

          {/* AI Microservice Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-slate-400">AI / OCR Service</span>
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white mb-1">Python FastAPI</div>
            <div className="text-xs font-mono">
              Status: <span className={aiHealth.status === 'online' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{aiHealth.status}</span> (Port 8000)
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 flex justify-between items-center text-xs text-slate-500">
          <span>Database: MySQL 8.x (Port 3306)</span>
          <span>PackCheck AI v0.1.0-PHASE1</span>
        </div>
      </div>
    </div>
  );
}

export default App;
