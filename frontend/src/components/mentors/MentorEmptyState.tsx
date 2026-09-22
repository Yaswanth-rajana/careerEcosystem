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
    <div className="py-16 px-6 text-center max-w-md mx-auto rounded-3xl border border-slate-200/80 bg-white/50 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 font-display mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{description}</p>
      <Button
        variant="outline"
        size="md"
        leftIcon={<RefreshCw className="w-4 h-4" />}
        onClick={onClearFilters}
        className="border-slate-300 hover:border-blue-600 font-semibold"
      >
        Clear All Filters
      </Button>
    </div>
  );
};
