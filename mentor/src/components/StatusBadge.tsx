import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status.replace(/_/g, ' ');

  switch (normalized) {
    case 'CONFIRMED':
    case 'APPROVED':
    case 'ACTIVE':
    case 'COMPLETED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'SCHEDULED':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'IN_PROGRESS':
      styles = 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      break;
    case 'RESCHEDULE_REQUESTED':
      styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'CANCELLED_BY_CANDIDATE':
    case 'CANCELLED_BY_MENTOR':
    case 'CANCELLED':
    case 'REJECTED':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'SUSPENDED':
    case 'NO_SHOW':
      styles = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize tracking-wide ${sizeClasses} ${styles}`}
    >
      {label.toLowerCase()}
    </span>
  );
}
