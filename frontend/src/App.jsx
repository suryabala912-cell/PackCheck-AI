import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Cpu, LogOut, CheckCircle, User, ShieldAlert, KeyRound, AlertTriangle, UploadCloud } from 'lucide-react';
import api from './api/axios';
import Login from './components/Login';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('packcheck_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentToken, setCurrentToken] = useState(() => {
    return localStorage.getItem('packcheck_token') || null;
  });

  const [backendHealth, setBackendHealth] = useState({ status: 'checking', details: null });
  const [aiHealth, setAiHealth] = useState({ status: 'checking', details: null });
  const [rbacNotice, setRbacNotice] = useState(null);
  const [scanTestResult, setScanTestResult] = useState(null);
  const [scanTesting, setScanTesting] = useState(false);

  useEffect(() => {
    const handleGlobalLogout = () => {
      setCurrentUser(null);
      setCurrentToken(null);
      setRbacNotice('Session expired or unauthorized. Please sign in again.');
    };

    window.addEventListener('packcheck_logout', handleGlobalLogout);
    return () => window.removeEventListener('packcheck_logout', handleGlobalLogout);
  }, []);

  useEffect(() => {
    if (currentUser && currentToken) {
      // Check Spring Boot Backend health (Public endpoint)
      api.get('/api/v1/health')
        .then(res => setBackendHealth({ status: 'online', details: res.data }))
        .catch(err => setBackendHealth({ status: 'offline', details: err.message }));

      // Check Python FastAPI AI Service health (Public endpoint)
      axiosGetAiHealth();
    }
  }, [currentUser, currentToken]);

  const axiosGetAiHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/health');
      const data = await res.json();
      setAiHealth({ status: 'online', details: data });
    } catch (err) {
      setAiHealth({ status: 'offline', details: err.message });
    }
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setCurrentToken(token);
    setRbacNotice(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('packcheck_token');
    localStorage.removeItem('packcheck_user');
    setCurrentUser(null);
    setCurrentToken(null);
    setRbacNotice(null);
    setScanTestResult(null);
  };

  // Test Role Authorization: Call Admin Endpoint
  const testAdminAccess = async () => {
    setRbacNotice(null);
    try {
      await api.get('/api/v1/admin/dashboard');
      setRbacNotice({ type: 'success', message: 'Admin endpoint access granted!' });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setRbacNotice({ type: 'error', message: 'You do not have permission to perform this action. (HTTP 403 Forbidden)' });
      } else {
        setRbacNotice({ type: 'info', message: `Response status: ${err.response?.status || 'Network Error'}` });
      }
    }
  };

  // Test Protected Endpoint: Scan Analysis Request
  const testScanAnalysis = async () => {
    setScanTesting(true);
    setRbacNotice(null);
    setScanTestResult(null);

    try {
      const blob = new Blob(['fake image content'], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'sample_label.jpg');
      formData.append('product_name', 'Test Commodity');
      formData.append('category', 'Retail Food');
      formData.append('is_imported', 'false');

      const res = await api.post('/api/v1/scans/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScanTestResult(res.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setRbacNotice({ type: 'error', message: 'You do not have permission to perform this action. (HTTP 403 Forbidden)' });
      } else if (err.response && err.response.data) {
        setScanTestResult({ error: err.response.data.error || err.response.data.message });
      } else {
        setScanTestResult({ error: 'Network error or backend offline' });
      }
    } finally {
      setScanTesting(false);
    }
  };

  if (!currentUser || !currentToken) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'SUPERVISOR':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* Top Navbar */}
      <div className="max-w-4xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-4 md:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-9 h-9 text-indigo-400 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              PackCheck AI
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 3 Prototype Auth
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Legal Metrology Compliance System • SIH26034
            </p>
          </div>
        </div>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-700/80 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white">{currentUser.full_name || currentUser.fullName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400">{currentUser.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RBAC Notice Banner */}
      {rbacNotice && (
        <div className={`max-w-4xl w-full mb-6 p-4 rounded-xl border flex items-center gap-3 text-xs ${
          rbacNotice.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
          rbacNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{rbacNotice.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Frontend Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Frontend UI</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white mb-1">React + Vite</div>
          <div className="text-xs text-slate-400 font-mono">JWT Interceptor Active</div>
        </div>

        {/* Backend Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Backend Domain</span>
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white mb-1">Spring Boot 3</div>
          <div className="text-xs font-mono">
            Status: <span className={backendHealth.status === 'online' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{backendHealth.status}</span>
          </div>
        </div>

        {/* AI Service Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">AI / OCR Service</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white mb-1">Python FastAPI</div>
          <div className="text-xs font-mono">
            Status: <span className={aiHealth.status === 'online' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{aiHealth.status}</span>
          </div>
        </div>
      </div>

      {/* RBAC Verification Sandbox */}
      <div className="max-w-4xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          Role-Based Access Control Verification
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Test JWT bearer authorization against role-restricted Spring Boot backend endpoints.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={testScanAnalysis}
            disabled={scanTesting}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Test Scan Endpoint (Permitted for Officers/Supervisors/Admins)</span>
          </button>

          <button
            onClick={testAdminAccess}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Test Admin Endpoint (Requires ADMIN Role)</span>
          </button>
        </div>

        {scanTestResult && (
          <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
            <pre>{JSON.stringify(scanTestResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
