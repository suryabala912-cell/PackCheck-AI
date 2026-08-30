import React, { useState, useEffect } from 'react';
import { scanApi } from '../api/scanApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import ImageBoundingBoxViewer from '../components/ImageBoundingBoxViewer';
import DeclarationCard from '../components/DeclarationCard';
import RuleResultCard from '../components/RuleResultCard';
import ManualReviewModal from '../components/ManualReviewModal';
import { ArrowLeft, ShieldCheck, ShieldAlert, CheckCircle2, History, UserCheck, Calendar, Globe, Tag } from 'lucide-react';

export default function ScanDetailsPage({ scanReference, currentUser, onNavigate }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeDeclarationKey, setActiveDeclarationKey] = useState(null);

  useEffect(() => {
    if (scanReference) {
      fetchDetails();
    }
  }, [scanReference]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scanApi.getScanDetails(scanReference);
      setScan(data);
    } catch (err) {
      console.error('Error fetching scan details:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Scan not found.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = (updatedScan) => {
    setScan(updatedScan);
    setShowReviewModal(false);
  };

  if (loading) {
    return <LoadingSpinner message={`Fetching details for scan ${scanReference}...`} />;
  }

  if (error || !scan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <button
          onClick={() => onNavigate('/scans')}
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scan History
        </button>
        <ErrorMessage message={error || 'Scan record not found.'} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <button
            onClick={() => onNavigate('/scans')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Scan History
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
              {scan.scan_reference_number}
            </h1>
            <StatusBadge status={scan.preliminary_assessment} type="assessment" />
            <StatusBadge status={scan.review_status} type="review" />
          </div>
        </div>

        {/* Manual Review Button */}
        <button
          onClick={() => setShowReviewModal(true)}
          className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          Submit Officer Manual Review
        </button>
      </div>

      {/* Statutory Disclaimer */}
      <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-xs text-amber-200 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          <strong>Statutory Compliance Disclaimer:</strong> {scan.disclaimer || "AI preliminary assessment — human officer verification required under Legal Metrology Rules, 2011."}
        </span>
      </div>

      {/* Package Metadata Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Product Name</span>
          <p className="text-sm font-bold text-slate-100">{scan.product_name}</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Category & Origin</span>
          <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            {scan.category} ({scan.is_imported ? 'Imported' : 'Domestic'})
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Scanning Officer</span>
          <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            {scan.officer?.full_name || scan.officer?.email || 'Officer'}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Scan Date & Time</span>
          <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {scan.scan_timestamp ? new Date(scan.scan_timestamp).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Image Bounding Box Visualizer & Declarations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visual Inspector (7 cols) */}
        <div className="lg:col-span-7">
          <ImageBoundingBoxViewer
            imageUrl={scan.image_url}
            declarations={scan.declarations || []}
            activeKey={activeDeclarationKey}
            onSelectKey={(key) => setActiveDeclarationKey(key)}
          />
        </div>

        {/* Declarations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-cyan-400" />
            Extracted Declarations ({scan.declarations?.length || 0})
          </h2>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {scan.declarations?.map((decl, idx) => (
              <DeclarationCard
                key={idx}
                declaration={decl}
                isSelected={activeDeclarationKey === decl.declaration_key}
                onSelect={(key) => setActiveDeclarationKey(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Rule Evaluation Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          Rule Engine Compliance Evaluations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scan.rule_evaluations?.map((rule, idx) => (
            <RuleResultCard key={idx} rule={rule} />
          ))}
        </div>
      </div>

      {/* Manual Review Audit Log History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          Immutable Officer Manual Review Audit Logs ({scan.manual_review_logs?.length || 0})
        </h2>

        {!scan.manual_review_logs || scan.manual_review_logs.length === 0 ? (
          <p className="text-xs text-slate-500 italic bg-slate-950 p-4 rounded-xl border border-slate-850">
            No officer review audit entries recorded yet. Click "Submit Officer Manual Review" above to log an inspection decision.
          </p>
        ) : (
          <div className="space-y-3">
            {scan.manual_review_logs.map((log, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <span className="font-bold text-cyan-300">
                    Action: {log.action_taken}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Status Changed:</span>
                  <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300">{log.previous_status || 'NONE'}</span>
                  <span>→</span>
                  <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-cyan-300">{log.new_status}</span>
                </div>
                {log.officer_notes && (
                  <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed font-sans">
                    <strong>Notes:</strong> {log.officer_notes}
                  </p>
                )}
                <div className="text-[11px] text-slate-500 text-right">
                  Reviewed by: {log.officer?.full_name || log.officer?.email || 'Officer'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Review Modal */}
      {showReviewModal && (
        <ManualReviewModal
          scanReference={scan.scan_reference_number}
          currentReviewStatus={scan.review_status}
          onSuccess={handleReviewSuccess}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
