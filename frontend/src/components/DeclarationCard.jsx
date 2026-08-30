import React from 'react';
import StatusBadge from './StatusBadge';
import { Tag, Percent, Crosshair, CheckCircle2 } from 'lucide-react';

export default function DeclarationCard({ declaration, onSelectBox }) {
  if (!declaration) return null;

  const keyLabels = {
    MANUFACTURER_ADDRESS: 'Manufacturer Address',
    COMMODITY_NAME: 'Generic / Commodity Name',
    NET_QUANTITY: 'Net Quantity',
    MFG_DATE: 'Date of Manufacture / Packing',
    MRP: 'Maximum Retail Price (MRP)',
    UNIT_SALE_PRICE: 'Unit Sale Price (USP)',
    CONSUMER_CARE: 'Consumer Care Details',
    COUNTRY_OF_ORIGIN: 'Country of Origin',
  };

  const formattedKey = keyLabels[declaration.declaration_key] || declaration.declaration_key;
  const confidencePct = Math.round((declaration.ocr_confidence || 0) * 100);

  const getConfidenceColor = (pct) => {
    if (pct >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 50) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600 shrink-0" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {formattedKey}
            </h4>
          </div>
          <StatusBadge status={declaration.verification_status || 'UNVERIFIED'} />
        </div>

        {/* Extracted Value Display */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 font-medium text-sm min-h-[48px] break-words">
          {declaration.extracted_value ? (
            <span>{declaration.extracted_value}</span>
          ) : (
            <span className="text-slate-400 italic text-xs">No value detected by OCR engine</span>
          )}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* Confidence Percentage */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500">OCR Confidence:</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getConfidenceColor(confidencePct)}`}>
            {confidencePct}%
          </span>
        </div>

        {/* Interactive Bounding Box Highlight Button */}
        {declaration.bounding_box_json && onSelectBox && (
          <button
            onClick={() => onSelectBox(declaration)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition cursor-pointer text-[11px]"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Highlight Box</span>
          </button>
        )}
      </div>

      {/* Confidence Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${getProgressColor(confidencePct)}`}
          style={{ width: `${Math.max(confidencePct, 4)}%` }}
        />
      </div>
    </div>
  );
}
