import React from 'react';
import { CheckCircle2, AlertOctagon, HelpCircle, ShieldCheck, Clock } from 'lucide-react';

export default function StatusBadge({ status, type = 'assessment' }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  if (type === 'assessment') {
    if (normalized === 'PRELIMINARY_COMPLIANT' || normalized === 'COMPLIANT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Preliminary Compliant
        </span>
      );
    }
    if (normalized === 'POTENTIAL_VIOLATION' || normalized === 'NON_COMPLIANT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          Potential Violation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm">
        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
        Requires Manual Review
      </span>
    );
  }

  if (type === 'review') {
    if (normalized === 'OFFICER_VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Officer Verified
        </span>
      );
    }
    if (normalized === 'UNDER_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          Under Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        Pending Review
      </span>
    );
  }

  if (type === 'rule') {
    if (normalized === 'PASS') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
          PASS
        </span>
      );
    }
    if (normalized === 'FAIL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-900/60 text-rose-300 border border-rose-700/50">
          FAIL
        </span>
      );
    }
    if (normalized === 'NOT_APPLICABLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          N/A
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-900/60 text-amber-300 border border-amber-700/50">
        MANUAL REVIEW
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {status}
    </span>
  );
}
