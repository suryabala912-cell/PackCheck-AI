import React, { useState, useEffect } from 'react';
import { scanApi } from '../api/scanApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { History, Search, Filter, Scan, ExternalLink } from 'lucide-react';

export default function ScanHistoryPage({ onNavigate }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scanApi.getScanHistory();
      setScans(data || []);
    } catch (err) {
      console.error('Error fetching scan history:', err);
      setError('Failed to retrieve scan history.');
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      !searchTerm ||
      scan.scan_reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      scan.review_status === statusFilter ||
      scan.preliminary_assessment === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            Inspection Audit Records
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Persisted Scan History
          </h1>
          <p className="text-xs text-slate-400">
            Complete audit record of package label compliance evaluations and enforcement actions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/scan')}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 self-start"
        >
          <Scan className="w-4 h-4" />
          New Label Scan
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reference, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Scan Statuses</option>
            <option value="PENDING_REVIEW">PENDING_REVIEW</option>
            <option value="OFFICER_VERIFIED">OFFICER_VERIFIED</option>
            <option value="PRELIMINARY_COMPLIANT">PRELIMINARY_COMPLIANT</option>
            <option value="POTENTIAL_VIOLATION">POTENTIAL_VIOLATION</option>
            <option value="REQUIRES_MANUAL_REVIEW">REQUIRES_MANUAL_REVIEW</option>
          </select>
        </div>
      </div>

      {/* Scan History List */}
      {loading ? (
        <LoadingSpinner message="Loading persisted scan history..." />
      ) : filteredScans.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500">
          <History className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="font-bold text-slate-300 text-sm">No scan records matching your filter.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing search filters or initiate a new package scan.</p>
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
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Enforcement Officer</th>
                  <th className="py-3.5 px-4">AI Assessment</th>
                  <th className="py-3.5 px-4">Review Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredScans.map((scan) => (
                  <tr key={scan.id || scan.scan_reference_number} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {scan.scan_reference_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-100 font-semibold">{scan.product_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{scan.category}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {scan.scan_timestamp ? new Date(scan.scan_timestamp).toLocaleString() : 'N/A'}
                    </td>
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
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-800 transition-colors text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
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
