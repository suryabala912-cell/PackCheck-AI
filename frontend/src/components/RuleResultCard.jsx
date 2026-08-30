import React from 'react';
import StatusBadge from './StatusBadge';
import { Scale, BookOpen, AlertCircle } from 'lucide-react';

export default function RuleResultCard({ ruleResult }) {
  if (!ruleResult) return null;

  const getCardBorder = (status) => {
    switch (status) {
      case 'PASS':
        return 'border-l-4 border-l-emerald-500 border-slate-200';
      case 'FAIL':
        return 'border-l-4 border-l-rose-500 border-slate-200';
      case 'MANUAL_REVIEW':
      case 'NOT_DETECTED':
        return 'border-l-4 border-l-amber-500 border-slate-200';
      default:
        return 'border-slate-200';
    }
  };

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-2xs hover:shadow-md transition-all ${getCardBorder(ruleResult.evaluation_status)} space-y-2.5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {ruleResult.rule_code}
            </span>
            {ruleResult.legal_reference && (
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-slate-400" />
                {ruleResult.legal_reference}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-tight">
            {ruleResult.rule_name || ruleResult.declaration_key}
          </h4>
        </div>

        <StatusBadge status={ruleResult.evaluation_status} />
      </div>

      {/* Details Box */}
      {ruleResult.reason_details && (
        <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-700 leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{ruleResult.reason_details}</span>
        </div>
      )}
    </div>
  );
}
