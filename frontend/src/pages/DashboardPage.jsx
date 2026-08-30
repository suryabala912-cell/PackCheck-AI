import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  Search,
  Scale
} from 'lucide-react';
import { scanApi } from '../api/scanApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function DashboardPage({ currentUser, onNavigate }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanApi.getScanHistory();
      setScans(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard scan history.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics computation
  const totalScans = scans.length;
  const compliantScans = scans.filter(s => s.preliminary_assessment === 'PRELIMINARY_COMPLIANT').length;
  const violationScans = scans.filter(s => s.preliminary_assessment === 'POTENTIAL_VIOLATION').length;
  const pendingReviewScans = scans.filter(s => s.review_status === 'PENDING_REVIEW' || s.preliminary_assessment === 'REQUIRES_MANUAL_REVIEW').length;

  const recentScans = scans.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Metrology Automated Inspection Platform</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Enforcement Officer Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Welcome back, <strong className="text-slate-900">{currentUser?.full_name || currentUser?.fullName || 'Officer'}</strong> ({currentUser?.role}). Monitor compliance scans, audit declaration evidence, and process manual reviews.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/scan')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>New Label Scan</span>
          </button>
          
          <button
            onClick={() => onNavigate('/reviews')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-slate-500" />
            <span>Review Queue ({pendingReviewScans})</span>
          </button>
        </div>
      </div>

      {/* Statutory Legal Disclaimer Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Statutory Notice:</span> AI preliminary compliance assessments are advisory under Legal Metrology (Packaged Commodities) Rules, 2011. Human officer verification and manual sign-off are required prior to issuing official penalty notices or statutory enforcement orders.
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Scans Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Package Scans</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Scan className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{loading ? '...' : totalScans}</div>
            <div className="text-xs text-slate-500 mt-1">Persisted inspection records</div>
          </div>
        </div>

        {/* Compliant Scans Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Compliant</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-600">{loading ? '...' : compliantScans}</div>
            <div className="text-xs text-emerald-700 font-medium mt-1">Preliminary compliant</div>
          </div>
        </div>

        {/* Potential Violations Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potential Violations</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-600">{loading ? '...' : violationScans}</div>
            <div className="text-xs text-rose-700 font-medium mt-1">Requires legal review</div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Officer Review</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-amber-600">{loading ? '...' : pendingReviewScans}</div>
            <div className="text-xs text-amber-700 font-medium mt-1">Awaiting officer action</div>
          </div>
        </div>
      </div>

      {/* Recent Inspections Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Package Inspections</h3>
            <p className="text-xs text-slate-500">Latest Legal Metrology label analysis records</p>
          </div>
          <button
            onClick={() => onNavigate('/scans')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Scans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching recent scan history..." />
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} onRetry={fetchDashboardData} />
          </div>
        ) : recentScans.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No Scans Recorded Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start your first Legal Metrology package scan to generate preliminary compliance assessments.
            </p>
            <button
              onClick={() => onNavigate('/scan')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition cursor-pointer"
            >
              Start First Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Scan Reference</th>
                  <th className="px-6 py-3">Commodity / Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">AI Preliminary</th>
                  <th className="px-6 py-3">Review Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScans.map((scan) => (
                  <tr key={scan.scan_reference_number} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {scan.scan_reference_number}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {scan.product_name || 'Unspecified Commodity'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {scan.category || 'General'}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={scan.preliminary_assessment} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={scan.review_status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate(`/scans/${scan.scan_reference_number}`)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200 cursor-pointer"
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
