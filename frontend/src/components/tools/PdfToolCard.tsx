'use client';

import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

export interface PdfToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  actionLabel: string;
  onClick: () => void;
  isActive?: boolean;
}

export const PdfToolCard: React.FC<PdfToolCardProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  actionLabel,
  onClick,
  isActive = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 group ${
        isActive
          ? 'bg-indigo-50/40 border-[#6366F1] shadow-md ring-1 ring-[#6366F1]'
          : 'bg-white border-slate-200/80 hover:border-[#6366F1]/50 hover:shadow-sm'
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-200/60 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-[#6366F1] transition-colors">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isActive
              ? 'bg-black text-white shadow-md'
              : 'border border-slate-200 text-slate-700 hover:bg-black hover:text-white'
          }`}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
