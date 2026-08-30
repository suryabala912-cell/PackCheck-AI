import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Scan, Eye, ArrowUpDown, Calendar, User } from 'lucide-react';
import { scanApi } from '../api/scanApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ScanHistoryPage({ onNavigate }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssessment, setFilterAssessment] = useState('ALL');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanApi.getScanHistory();
      setScans(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch scan history records.');
    } finally {
      setLoading(false);
    }
  };

  // Search & Filter Logic
  const filteredScans = scans.filter((scan) => {
    const matchesSearch = 
      (scan.scan_reference_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scan.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scan.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAssessment = 
      filterAssessment === 'ALL' || 
      scan.preliminary_assessment === filterAssessment;

    return matchesSearch && matchesAssessment;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Inspection Audit Records</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Scan History Repository
          </h1>
          <p className="text-sm text-slate-600">
            View, search, and filter all historical Legal Metrology package compliance assessments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/scan')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Scan className="w-4 h-4" />
          <span>New Scan</span>
        </button>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, product, category..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
            />
          </div>

          {/* Assessment Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Assessment:</span>
            </span>
            
            {[
              { id: 'ALL', label: 'All Scans' },
              { id: 'PRELIMINARY_COMPLIANT', label: 'Compliant' },
              { id: 'POTENTIAL_VIOLATION', label: 'Violations' },
              { id: 'REQUIRES_MANUAL_REVIEW', label: 'Needs Review' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterAssessment(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterAssessment === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading scan history records..." />
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} onRetry={fetchScans} />
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No Scan Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No inspection records match your current filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Scan Reference</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Commodity / Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">AI Preliminary</th>
                  <th className="px-6 py-3.5">Review Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScans.map((scan) => (
                  <tr 
                    key={scan.scan_reference_number}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onNavigate(`/scans/${scan.scan_reference_number}`)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {scan.scan_reference_number}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(scan.scan_timestamp || Date.now()).toLocaleDateString()}{' '}
                      <span className="text-slate-400">{new Date(scan.scan_timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {scan.product_name || 'Unspecified Commodity'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {scan.category || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={scan.preliminary_assessment} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={scan.review_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(`/scans/${scan.scan_reference_number}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200 cursor-pointer"
                      >
                        Details
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
