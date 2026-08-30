import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading compliance data...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 animate-fade-in">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      {message && (
        <p className="text-xs font-medium text-slate-500 tracking-wide">{message}</p>
      )}
    </div>
  );
}
