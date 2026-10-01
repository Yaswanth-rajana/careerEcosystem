import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: 'neutral' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  onClick,
}) => {
  const badgeColors = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  }[badge?.variant || 'neutral'];

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeColors}`}>
            {badge.text}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1.5 text-xs text-slate-500 truncate">{subtext}</p>}
    </div>
  );
};
