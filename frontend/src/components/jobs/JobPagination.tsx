import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const JobPagination: React.FC<Props> = ({
  page,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with windowing
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      aria-label="Jobs pagination"
      className={cn('flex items-center justify-center gap-1.5 py-6', className)}
    >
      {/* Prev */}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pages */}
      {getPageNumbers().map((p, index) => {
        if (p === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400 font-bold text-xs select-none">
              ...
            </span>
          );
        }

        const isCurrent = p === page;
        return (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => onPageChange(p as number)}
            className={cn(
              'w-9 h-9 rounded-xl text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
              isCurrent
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            )}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
