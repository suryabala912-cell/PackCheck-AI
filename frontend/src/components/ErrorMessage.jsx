import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="bg-red-950/80 border border-red-800/60 text-red-200 px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3 my-4">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">
        <span className="block">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 transition-colors p-1 rounded-md"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
