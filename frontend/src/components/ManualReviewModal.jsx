import React, { useState } from 'react';
import { ShieldCheck, Scale, AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ManualReviewModal({ scan, isOpen, onClose, onSubmit, submitting }) {
  const [newStatus, setNewStatus] = useState('OFFICER_VERIFIED');
  const [actionTaken, setActionTaken] = useState('APPROVED_ASSESSMENT');
  const [officerNotes, setOfficerNotes] = useState('');

  if (!isOpen || !scan) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      new_status: newStatus,
      action_taken: actionTaken,
      officer_notes: officerNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Submit Officer Manual Review
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Scan Reference: {scan.scan_reference_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* AI Preliminary Assessment Callout */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                AI Preliminary Assessment
              </span>
              <StatusBadge status={scan.preliminary_assessment} />
            </div>
            <p className="text-slate-700 text-xs font-medium">
              Product: <span className="font-bold text-slate-900">{scan.product_name || 'Unspecified Commodity'}</span>
            </p>
          </div>

          {/* Statutory Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">
              <strong>Statutory Notice:</strong> Human officer verification is required under Legal Metrology Rules, 2011 before issuing compliance orders.
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Updated Review Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3.5 py-2 text-sm text-slate-900 transition outline-none"
            >
              <option value="OFFICER_VERIFIED">OFFICER_VERIFIED (Official Verification Complete)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Inspection Pending Further Evidence)</option>
              <option value="PENDING_REVIEW">PENDING_REVIEW (Awaiting Initial Officer Audit)</option>
            </select>
          </div>

          {/* Action Taken Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Taken Decision <span className="text-rose-500">*</span>
            </label>
            <select
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3.5 py-2 text-sm text-slate-900 transition outline-none"
            >
              <option value="APPROVED_ASSESSMENT">APPROVED_ASSESSMENT (Confirm AI Preliminary Assessment)</option>
              <option value="CONFIRMED_VIOLATION">CONFIRMED_VIOLATION (Issue Statutory Non-Compliance Order)</option>
              <option value="DISMISSED_VIOLATION">DISMISSED_VIOLATION (Dismiss Preliminary AI Violation Flag)</option>
              <option value="EDITED_DECLARATION">EDITED_DECLARATION (Manual Field Override Applied)</option>
            </select>
          </div>

          {/* Officer Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Officer Inspection Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Record official inspection notes, field verification evidence, or legal justification..."
              rows={3}
              required
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Officer Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
