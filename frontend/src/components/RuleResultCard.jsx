import React from 'react';
import StatusBadge from './StatusBadge';
import { Scale, FileText } from 'lucide-react';

export default function RuleResultCard({ rule }) {
  if (!rule) return null;

  const ruleCode = rule.rule_code || rule.ruleCode;
  const status = rule.evaluation_status || rule.evaluationStatus || 'MANUAL_REVIEW';
  const reason = rule.reason_details || rule.reasonDetails || rule.message || 'Verification required by enforcement officer.';

  return (
    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-xs text-slate-200 uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          {ruleCode}
        </span>
        <StatusBadge status={status} type="rule" />
      </div>

      <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-850 flex items-start gap-1.5">
        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <span>{reason}</span>
      </div>
    </div>
  );
}
