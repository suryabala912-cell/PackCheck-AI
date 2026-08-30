import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ title = 'Error Encountered', message, onRetry }) {
  if (!message) return null;

  return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <h4 className="font-semibold text-rose-900">{title}</h4>
          <p className="text-rose-700 mt-0.5">{message}</p>
        </div>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 hover:text-rose-900 font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
