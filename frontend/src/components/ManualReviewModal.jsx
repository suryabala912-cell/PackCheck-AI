import React, { useState } from 'react';
import { reviewApi } from '../api/reviewApi';
import ErrorMessage from './ErrorMessage';
import { ShieldCheck, X, Check, Loader2 } from 'lucide-react';

export default function ManualReviewModal({ scanReference, currentReviewStatus, onSuccess, onClose }) {
  const [newStatus, setNewStatus] = useState('OFFICER_VERIFIED');
  const [actionTaken, setActionTaken] = useState('APPROVED_ASSESSMENT');
  const [officerNotes, setOfficerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actionTaken.trim()) {
      setError('Please specify the action taken.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewRequest = {
        new_status: newStatus,
        action_taken: actionTaken,
        officer_notes: officerNotes,
      };

      const updatedScan = await reviewApi.submitManualReview(scanReference, reviewRequest);
      if (onSuccess) {
        onSuccess(updatedScan);
      }
    } catch (err) {
      console.error('Failed to submit manual review:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to submit review.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Enforcement Officer Review Sign-Off</h2>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Submitting a manual review decision will update the scan review status and append an immutable audit log entry containing your officer identity and rationale.
        </p>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              New Review Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="OFFICER_VERIFIED">OFFICER_VERIFIED (Official Approval / Verification)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (In-Progress Investigation)</option>
              <option value="PENDING_REVIEW">PENDING_REVIEW (Re-queue for Review)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Action Taken
            </label>
            <select
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="APPROVED_ASSESSMENT">APPROVED_ASSESSMENT (Confirmed Preliminary AI Assessment)</option>
              <option value="CONFIRMED_VIOLATION">CONFIRMED_VIOLATION (Issued Violation Warning / Notice)</option>
              <option value="DISMISSED_VIOLATION">DISMISSED_VIOLATION (Dismissed Violation False Positive)</option>
              <option value="REQUESTED_RESCAN">REQUESTED_RESCAN (Requested Higher Resolution Re-scan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Officer Inspection Notes & Rationale
            </label>
            <textarea
              rows={3}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Enter official enforcement inspection details, rule citations, or notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Audit Log...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Officer Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
