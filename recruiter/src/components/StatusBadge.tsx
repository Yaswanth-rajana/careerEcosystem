import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const getStyle = () => {
    switch (normalized) {
      case 'PUBLISHED':
      case 'APPROVED':
      case 'HIRED':
      case 'ACCEPTED':
      case 'ACTIVE':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'UNDER_REVIEW':
      case 'SHORTLISTED':
      case 'INTERVIEW':
      case 'SCHEDULED':
      case 'SENT':
      case 'TASK_SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'PENDING':
      case 'NEEDS_INFORMATION':
      case 'TASK_PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-200';

      case 'DRAFT':
      case 'PAUSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      case 'REJECTED':
      case 'CLOSED':
      case 'SUSPENDED':
      case 'CANCELLED':
      case 'DECLINED':
      case 'NO_SHOW':
      case 'WITHDRAWN':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatText = () => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${sizeClass} ${getStyle()}`}
    >
      {formatText()}
    </span>
  );
};
