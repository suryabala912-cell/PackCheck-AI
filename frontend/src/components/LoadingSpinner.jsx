import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-slate-400 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.medium} animate-spin text-cyan-400`} />
      {message && <p className="text-sm font-medium text-slate-300">{message}</p>}
    </div>
  );
}
