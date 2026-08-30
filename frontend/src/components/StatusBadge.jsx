import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  MinusCircle,
  Eye
} from 'lucide-react';

export default function StatusBadge({ status, type = 'assessment', className = '' }) {
  if (!status) return null;

  const normalizedStatus = String(status).toUpperCase();

  let badgeConfig = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: HelpCircle,
    label: normalizedStatus,
  };

  // 1. Preliminary / Compliance Assessment Statuses
  if (normalizedStatus === 'PRELIMINARY_COMPLIANT' || normalizedStatus === 'COMPLIANT' || normalizedStatus === 'PASS') {
    badgeConfig = {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: CheckCircle2,
      label: normalizedStatus === 'PRELIMINARY_COMPLIANT' ? 'Preliminary Compliant' : normalizedStatus === 'PASS' ? 'Passed' : 'Compliant',
    };
  } else if (normalizedStatus === 'POTENTIAL_VIOLATION' || normalizedStatus === 'NON_COMPLIANT' || normalizedStatus === 'FAIL') {
    badgeConfig = {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: XCircle,
      label: normalizedStatus === 'POTENTIAL_VIOLATION' ? 'Potential Violation' : normalizedStatus === 'FAIL' ? 'Failed' : 'Non-Compliant',
    };
  } else if (normalizedStatus === 'REQUIRES_MANUAL_REVIEW' || normalizedStatus === 'MANUAL_REVIEW' || normalizedStatus === 'NEEDS_HUMAN_OFFICER_REVIEW') {
    badgeConfig = {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: AlertTriangle,
      label: 'Requires Manual Review',
    };
  }
  
  // 2. Review Queue / Audit Statuses
  else if (normalizedStatus === 'PENDING_REVIEW') {
    badgeConfig = {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: Clock,
      label: 'Pending Review',
    };
  } else if (normalizedStatus === 'UNDER_REVIEW') {
    badgeConfig = {
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      icon: Eye,
      label: 'Under Review',
    };
  } else if (normalizedStatus === 'OFFICER_VERIFIED' || normalizedStatus === 'CONFIRMED') {
    badgeConfig = {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: ShieldCheck,
      label: normalizedStatus === 'CONFIRMED' ? 'Confirmed' : 'Officer Verified',
    };
  }

  // 3. Declaration / Detection Statuses
  else if (normalizedStatus === 'DETECTED') {
    badgeConfig = {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: CheckCircle2,
      label: 'Detected',
    };
  } else if (normalizedStatus === 'NOT_DETECTED') {
    badgeConfig = {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: MinusCircle,
      label: 'Not Detected',
    };
  } else if (normalizedStatus === 'NOT_APPLICABLE') {
    badgeConfig = {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: MinusCircle,
      label: 'N/A',
    };
  } else if (normalizedStatus === 'EDITED_BY_OFFICER') {
    badgeConfig = {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: ShieldCheck,
      label: 'Officer Edited',
    };
  }

  const IconComponent = badgeConfig.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeConfig.bg} ${className}`}>
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{badgeConfig.label}</span>
    </span>
  );
}
