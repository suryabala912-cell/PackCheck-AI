import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Loader2, UserCheck, ShieldAlert } from 'lucide-react';
import { authApi } from '../api/authApi';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login(email, password);
      const { token, user } = response;
      
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

  const setDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('PackCheck@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        
        {/* Header Branding */}
        <div className="p-8 border-b border-slate-100 text-center bg-slate-50/50">
          <div className="inline-flex items-center justify-center p-3.5 bg-blue-50 border border-blue-200 rounded-2xl mb-4 shadow-2xs">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">PackCheck AI</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Legal Metrology Preliminary Compliance System • SIH26034
          </p>
        </div>

        {/* Demo Quick-fill Accounts */}
        <div className="px-8 pt-6 pb-2">
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Prototype Demo Accounts</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">Quick Fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('officer@packcheck.ai')}
              className="px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition flex flex-col items-center gap-1 group text-center cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
              <span>Officer</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('supervisor@packcheck.ai')}
              className="px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition flex flex-col items-center gap-1 group text-center cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
              <span>Supervisor</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@packcheck.ai')}
              className="px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-xs font-semibold text-slate-700 hover:text-purple-700 transition flex flex-col items-center gap-1 group text-center cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@packcheck.ai"
                required
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
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

        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[11px] text-slate-500 font-medium">
          Role-Based Access Control Enabled • Spring Security + JWT
        </div>
      </div>
    </div>
  );
}
