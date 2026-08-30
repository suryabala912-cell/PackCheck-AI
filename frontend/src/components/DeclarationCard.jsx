import React from 'react';
import { Tag, CheckCircle2, Edit3, AlertCircle } from 'lucide-react';

export default function DeclarationCard({ declaration, onSelect, isSelected }) {
  if (!declaration) return null;

  const key = declaration.declaration_key || declaration.declarationKey || declaration.field_name || declaration.fieldName;
  const rawValue = declaration.extracted_value || declaration.extractedValue || declaration.raw_text;
  const verifiedValue = declaration.verified_value || declaration.verifiedValue;
  const status = declaration.verification_status || declaration.verificationStatus || 'UNVERIFIED';
  const confidence = declaration.ocr_confidence || declaration.ocrConfidence || declaration.confidence;
  const confidencePct = confidence ? Math.round(Number(confidence) * (Number(confidence) <= 1 ? 100 : 1)) : null;

  return (
    <div
      onClick={() => onSelect && onSelect(key)}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 font-semibold text-xs text-cyan-300 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          {key}
        </span>
        {confidencePct !== null && (
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
            confidencePct >= 85 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
          }`}>
            {confidencePct}% OCR
          </span>
        )}
      </div>

      <div className="text-sm font-medium text-slate-100 bg-slate-950/80 px-2.5 py-1.5 rounded border border-slate-800/80 break-words font-mono">
        {rawValue || <span className="text-slate-500 italic">Not Detected</span>}
      </div>

      {verifiedValue && (
        <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-900/60">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Verified: <strong className="font-mono text-emerald-200">{verifiedValue}</strong></span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span className="capitalize text-slate-500">Status:</span>
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          {status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {status === 'EDITED_BY_OFFICER' && <Edit3 className="w-3 h-3 text-cyan-400" />}
          {status === 'UNVERIFIED' && <AlertCircle className="w-3 h-3 text-amber-400" />}
          {status}
        </span>
      </div>
    </div>
  );
}
