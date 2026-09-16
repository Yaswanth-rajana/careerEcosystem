'use client';

import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

export interface DiscoveryEndSectionProps {
  onScrollToTop: () => void;
}

export const DiscoveryEndSection: React.FC<DiscoveryEndSectionProps> = ({ onScrollToTop }) => {
  return (
    <div className="mt-16 mb-8 text-center py-10 px-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
        <span>YOUR PATHWAY STARTS HERE</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
        Choose a direction. We&apos;ll help you understand the path.
      </h3>

      <div className="pt-2 flex justify-center">
        <button
          onClick={onScrollToTop}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Explore Careers</span>
        </button>
      </div>
    </div>
  );
};
