'use client';

import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

interface MentorEmptyStateProps {
  onClearFilters: () => void;
  title?: string;
  description?: string;
}

export const MentorEmptyState: React.FC<MentorEmptyStateProps> = ({
  onClearFilters,
  title = 'No mentors match your criteria',
  description = 'Try adjusting your search query or removing active filters to discover available mentors.',
}) => {
  return (
    <div className="py-16 px-6 text-center max-w-md mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-[#111827]/50 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl bg-brand-indigo/10 text-brand-indigo flex items-center justify-center mx-auto mb-4 border border-brand-indigo/20">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{description}</p>
      <Button
        variant="outline"
        size="md"
        leftIcon={<RefreshCw className="w-4 h-4" />}
        onClick={onClearFilters}
        className="border-slate-300 dark:border-slate-700 hover:border-brand-indigo font-semibold"
      >
        Clear All Filters
      </Button>
    </div>
  );
};
