import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Loader2, UserCheck, ShieldAlert } from 'lucide-react';
import api from '../api/axios';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('packcheck_token', token);
      localStorage.setItem('packcheck_user', JSON.stringify(user));
      
      if (onLoginSuccess) {
        onLoginSuccess(user, token);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to connect to authentication backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('PackCheck@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 text-center bg-slate-800/80">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-4">
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PackCheck AI</h1>
          <p className="text-xs text-slate-400 mt-1">
            Legal Metrology Preliminary Compliance System (SIH26034)
          </p>
        </div>

        {/* Demo Quick-fill Account Selector */}
        <div className="px-8 pt-6 pb-2">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Prototype Demo Accounts</span>
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Demo Only</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('officer@packcheck.ai', 'Officer')}
              className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center gap-1 group text-center"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
              <span>Officer</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('supervisor@packcheck.ai', 'Supervisor')}
              className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center gap-1 group text-center"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
              <span>Supervisor</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@packcheck.ai', 'Admin')}
              className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500/50 text-xs font-medium text-slate-300 hover:text-white transition flex flex-col items-center gap-1 group text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@packcheck.ai"
                required
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="bg-slate-900/50 border-t border-slate-700 p-4 text-center text-[11px] text-slate-500">
          Role-Based Access Control Enabled • Spring Security + JWT
        </div>
      </div>
    </div>
  );
}
