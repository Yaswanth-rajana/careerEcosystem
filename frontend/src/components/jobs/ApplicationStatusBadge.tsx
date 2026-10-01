import React from 'react';
import { ApplicationStatus } from '@backend/types/jobs';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, FileText, Calendar, Award, XCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  status: ApplicationStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const ApplicationStatusBadge: React.FC<Props> = ({
  status,
  className,
  showIcon = true,
}) => {
  const config: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    APPLIED: {
      label: 'Applied',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    SHORTLISTED: {
      label: 'Shortlisted',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    TASK_PENDING: {
      label: 'Task Pending',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    TASK_SUBMITTED: {
      label: 'Task Submitted',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    INTERVIEW: {
      label: 'Interview',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    OFFER: {
      label: 'Offer Received',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      label: 'Not Selected',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    WITHDRAWN: {
      label: 'Withdrawn',
      bg: 'bg-slate-50',
      text: 'text-slate-500',
      border: 'border-slate-200',
      icon: <ArrowDownCircle className="w-3.5 h-3.5" />,
    },
  };

  const item = config[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs',
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      {showIcon && item.icon}
      <span>{item.label}</span>
    </span>
  );
};
