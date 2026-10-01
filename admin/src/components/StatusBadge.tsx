import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  // Green / Success
  if (['ACTIVE', 'PUBLISHED', 'APPROVED', 'OFFER', 'COMPLETED'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  // Amber / Warning / Pending
  else if (['PENDING', 'UNDER_REVIEW', 'REVIEW', 'DRAFT', 'TASK_PENDING', 'PAUSED'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  }
  // Blue / Info
  else if (['SHORTLISTED', 'INTERVIEW', 'TASK_SUBMITTED', 'IN_PROGRESS'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  }
  // Red / Danger
  else if (['REJECTED', 'SUSPENDED', 'DEACTIVATED', 'CLOSED', 'ARCHIVED', 'FAILED'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  // Purple / Role
  else if (['SUPER_ADMIN', 'ADMIN'].includes(normalized)) {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styles} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {normalized.replace(/_/g, ' ')}
    </span>
  );
};
