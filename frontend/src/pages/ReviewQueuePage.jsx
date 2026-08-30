import React, { useState, useEffect } from 'react';
import { FileCheck2, Filter, Search, ShieldCheck, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { reviewApi } from '../api/reviewApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ManualReviewModal from '../components/ManualReviewModal';

export default function ReviewQueuePage({ onNavigate }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('PENDING_REVIEW');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedScanForReview, setSelectedScanForReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewApi.getPendingReviews();
      setReviews(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending review queue records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (scan) => {
    setSelectedScanForReview(scan);
    setModalOpen(true);
  };

  const handleReviewSubmit = async (reviewPayload) => {
    if (!selectedScanForReview) return;
    setSubmittingReview(true);
    try {
      await reviewApi.submitReview(selectedScanForReview.scan_reference_number, reviewPayload);
      setModalOpen(false);
      await fetchReviewQueue(); // Refresh queue
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit officer review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter queue items
  const filteredReviews = reviews.filter((item) => {
    const matchesSearch = 
      (item.scan_reference_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      activeTab === 'ALL' || 
      item.review_status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = reviews.filter(r => r.review_status === 'PENDING_REVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Human Officer Inspection Queue ({pendingCount} Action Required)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Officer Review Queue
          </h1>
          <p className="text-sm text-slate-600">
            Audit AI preliminary assessments, review extracted declaration evidence, and sign off official compliance decisions.
          </p>
        </div>
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
              placeholder="Search reference or product..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
            />
          </div>

          {/* Review Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'PENDING_REVIEW', label: `Pending Action (${pendingCount})` },
              { id: 'UNDER_REVIEW', label: 'Under Review' },
              { id: 'OFFICER_VERIFIED', label: 'Officer Verified' },
              { id: 'ALL', label: 'All Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Review Queue Grid / Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching pending officer review queue..." />
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} onRetry={fetchReviewQueue} />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Review Queue Clear</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No inspection records matching tab <strong>{activeTab}</strong> require officer action at this time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Scan Reference</th>
                  <th className="px-6 py-3.5">Commodity / Product</th>
                  <th className="px-6 py-3.5">Scan Date</th>
                  <th className="px-6 py-3.5">AI Preliminary</th>
                  <th className="px-6 py-3.5">Review Status</th>
                  <th className="px-6 py-3.5 text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((scan) => (
                  <tr key={scan.scan_reference_number} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {scan.scan_reference_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {scan.product_name || 'Unspecified Commodity'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(scan.scan_timestamp || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={scan.preliminary_assessment} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={scan.review_status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigate(`/scans/${scan.scan_reference_number}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition cursor-pointer"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleOpenReviewModal(scan)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex-inline items-center gap-1 cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Review Modal Component */}
      <ManualReviewModal
        scan={selectedScanForReview}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleReviewSubmit}
        submitting={submittingReview}
      />
    </div>
  );
}
