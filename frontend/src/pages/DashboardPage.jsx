import React, { useState, useEffect } from 'react';
import { scanApi } from '../api/scanApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { ShieldAlert, Scan, FileCheck, Layers, ArrowRight, Clock, Scale } from 'lucide-react';

export default function DashboardPage({ currentUser, onNavigate }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await scanApi.getScanHistory();
      setScans(data || []);
    } catch (err) {
      console.error('Error loading dashboard scan history:', err);
      setError('Failed to fetch recent scan history.');
    } finally {
      setLoading(false);
    }
  };

  const totalScans = scans.length;
  const pendingReviews = scans.filter((s) => s.review_status === 'PENDING_REVIEW' || s.review_status === 'UNDER_REVIEW').length;
  const verifiedScans = scans.filter((s) => s.review_status === 'OFFICER_VERIFIED').length;
  const compliantScans = scans.filter((s) => s.preliminary_assessment === 'PRELIMINARY_COMPLIANT').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Legal Disclaimer */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Legal Metrology Automated Label Inspection Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Enforcement Officer Dashboard
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Welcome back, <strong className="text-slate-200">{currentUser?.full_name || currentUser?.email}</strong> ({currentUser?.role || 'ENFORCEMENT_OFFICER'}). Monitor compliance scans, perform inspection reviews, and audit declaration verification trails.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('/scan')}
              className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              New Label Scan
            </button>
            <button
              onClick={() => onNavigate('/reviews')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Review Queue ({pendingReviews})
            </button>
          </div>
        </div>

        {/* Mandatory Statutory Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs text-amber-300 bg-amber-950/40 p-3 rounded-xl border border-amber-800/50">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Statutory Notice:</strong> AI preliminary assessments are advisory under Legal Metrology Rules, 2011 — human officer verification is required before issuing official compliance orders.
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Package Scans</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-slate-100">{totalScans}</p>
          <p className="text-xs text-slate-500 mt-1">Persisted scan history</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Officer Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{pendingReviews}</p>
          <p className="text-xs text-slate-500 mt-1">Scans awaiting sign-off</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Officer Verified Scans</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400">{verifiedScans}</p>
          <p className="text-xs text-slate-500 mt-1">Manual audit log recorded</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Preliminary Compliant</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{compliantScans}</p>
          <p className="text-xs text-slate-500 mt-1">Initial high-confidence pass</p>
        </div>
      </div>

      {/* Recent Scans Table / Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Recent Label Inspections</h2>
            <p className="text-xs text-slate-400">Latest product package scans processed by the system</p>
          </div>
          <button
            onClick={() => onNavigate('/scans')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            View All Scans <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {loading ? (
          <LoadingSpinner message="Fetching scan history..." />
        ) : scans.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500">
            <Scan className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-400">No label scans found yet.</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Label Scan" to upload a product image for compliance evaluation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Scan Reference</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Officer</th>
                  <th className="py-3 px-4">AI Assessment</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {scans.slice(0, 5).map((scan) => (
                  <tr key={scan.id || scan.scan_reference_number} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {scan.scan_reference_number}
                    </td>
                    <td className="py-3 px-4 text-slate-200">{scan.product_name}</td>
                    <td className="py-3 px-4 text-slate-400">{scan.category}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {scan.officer?.full_name || scan.officer?.email || 'System Officer'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={scan.preliminary_assessment} type="assessment" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={scan.review_status} type="review" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate(`/scans/${scan.scan_reference_number}`)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-800 transition-colors text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
