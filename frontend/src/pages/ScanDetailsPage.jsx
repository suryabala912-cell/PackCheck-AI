import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Tag,
  BookOpen
} from 'lucide-react';
import { scanApi } from '../api/scanApi';
import { reviewApi } from '../api/reviewApi';
import DeclarationCard from '../components/DeclarationCard';
import RuleResultCard from '../components/RuleResultCard';
import ImageBoundingBoxViewer from '../components/ImageBoundingBoxViewer';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ManualReviewModal from '../components/ManualReviewModal';

export default function ScanDetailsPage({ scanReference, onNavigate }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);

  useEffect(() => {
    fetchScanDetails();
  }, [scanReference]);

  const fetchScanDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanApi.getScanByReference(scanReference);
      setScan(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch scan details record.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewPayload) => {
    setSubmittingReview(true);
    try {
      await reviewApi.submitReview(scanReference, reviewPayload);
      setModalOpen(false);
      await fetchScanDetails(); // Refresh details to show updated audit logs & review status
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit officer review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching complete inspection report..." />;
  if (error) return <div className="max-w-7xl mx-auto p-8"><ErrorMessage message={error} onRetry={fetchScanDetails} /></div>;
  if (!scan) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/scans')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scan History</span>
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Submit Officer Review</span>
        </button>
      </div>

      {/* Primary Report Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                {scan.scan_reference_number}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 uppercase">
                {scan.category || 'GENERAL'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {scan.product_name || 'Unspecified Commodity Label'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Preliminary Assessment</div>
              <StatusBadge status={scan.preliminary_assessment} className="mt-0.5" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Officer Review Status</div>
              <StatusBadge status={scan.review_status} className="mt-0.5" />
            </div>
          </div>
        </div>

        {/* Inspection Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Inspection Date</span>
            <span className="font-semibold text-slate-900">{new Date(scan.scan_timestamp || Date.now()).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Officer</span>
            <span className="font-semibold text-slate-900">{scan.officer_name || 'Demo Officer'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Imported Status</span>
            <span className="font-semibold text-slate-900">{scan.is_imported ? 'Yes (Importer Mandate)' : 'Domestic Packaging'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">UX Visual Completeness</span>
            <span className="font-semibold text-blue-700">{scan.ux_visual_score ? `${scan.ux_visual_score}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Statutory Legal Disclaimer Callout */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Statutory Legal Disclaimer:</strong> The status labeled <em>AI Preliminary Assessment</em> is generated by an automated vision algorithm for decision-support purposes under Legal Metrology Rules, 2011. Final compliance verification requires sign-off by an authorized human officer.
        </div>
      </div>

      {/* Visual Bounding Boxes Section */}
      <ImageBoundingBoxViewer
        imageUrl={scan.image_url}
        declarations={scan.extracted_declarations || []}
        selectedBox={selectedBox}
        onSelectBox={(dec) => setSelectedBox(dec)}
      />

      {/* Statutory Declarations Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Extracted Mandatory Declarations ({scan.extracted_declarations?.length || 0})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scan.extracted_declarations?.map((dec, idx) => (
            <DeclarationCard
              key={idx}
              declaration={dec}
              onSelectBox={(d) => setSelectedBox(d)}
            />
          ))}
        </div>
      </div>

      {/* Rule Evaluation Results Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          <span>Legal Metrology Rule Evaluations ({scan.rule_evaluation_results?.length || 0})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scan.rule_evaluation_results?.map((res, idx) => (
            <RuleResultCard key={idx} ruleResult={res} />
          ))}
        </div>
      </div>

      {/* Human Officer Review Audit Log History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Human Officer Inspection Audit Trail ({scan.review_logs?.length || 0})</span>
          </h3>
          <StatusBadge status={scan.review_status} />
        </div>

        {!scan.review_logs || scan.review_logs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-200/60">
            No officer manual review logs recorded yet for this scan.
          </div>
        ) : (
          <div className="space-y-3">
            {scan.review_logs.map((log, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">{log.officer_name || 'Enforcement Officer'}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {log.action_taken}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 font-medium">
                  "{log.officer_notes}"
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span>Status Transition:</span>
                  <StatusBadge status={log.previous_status} />
                  <span>→</span>
                  <StatusBadge status={log.new_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Review Modal Trigger */}
      <ManualReviewModal
        scan={scan}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleReviewSubmit}
        submitting={submittingReview}
      />
    </div>
  );
}
