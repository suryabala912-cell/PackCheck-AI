import React, { useState, useEffect } from 'react';
import { reviewApi } from '../api/reviewApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { FileCheck, Filter, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ReviewQueuePage({ onNavigate }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewApi.getReviewQueue(statusFilter === 'ALL' ? '' : statusFilter);
      setQueue(data || []);
    } catch (err) {
      console.error('Error fetching review queue:', err);
      setError('Failed to retrieve manual review queue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            Enforcement Officer Review Queue
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Manual Review Assignments
          </h1>
          <p className="text-xs text-slate-400">
            Package commodity scans requiring human inspection, declaration verification, or enforcement order sign-off.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {/* Statutory Disclaimer Notice */}
      <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-xs text-amber-200 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          <strong>Officer Duty Notice:</strong> AI preliminary assessments are advisory under Legal Metrology Rules, 2011 — human officer verification is required before issuing official compliance orders.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Queue Status:</span>
        </div>

        <div className="flex items-center gap-2">
          {[
            { label: 'Pending Review', value: 'PENDING_REVIEW' },
            { label: 'Under Review', value: 'UNDER_REVIEW' },
            { label: 'Officer Verified', value: 'OFFICER_VERIFIED' },
            { label: 'All Scans', value: 'ALL' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      {loading ? (
        <LoadingSpinner message="Fetching review queue items..." />
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
          <p className="font-bold text-slate-200 text-sm">No scans in queue for selected status.</p>
          <p className="text-xs text-slate-500 mt-1">All pending scans under this filter have been completed.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Scan Reference</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Officer</th>
                  <th className="py-3.5 px-4">AI Assessment</th>
                  <th className="py-3.5 px-4">Human Review Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {queue.map((scan) => (
                  <tr key={scan.id || scan.scan_reference_number} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {scan.scan_reference_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-100 font-semibold">{scan.product_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{scan.category}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {scan.officer?.full_name || scan.officer?.email || 'Officer'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={scan.preliminary_assessment} type="assessment" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={scan.review_status} type="review" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onNavigate(`/scans/${scan.scan_reference_number}`)}
                        className="px-3.5 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors text-xs font-bold shadow flex items-center gap-1 ml-auto"
                      >
                        Inspect & Sign-Off <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
