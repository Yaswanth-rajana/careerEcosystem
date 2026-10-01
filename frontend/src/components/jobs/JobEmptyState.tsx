import React from 'react';
import { SearchX, BookmarkX, FileQuestion, Briefcase } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import Link from 'next/link';

interface Props {
  type: 'search' | 'saved' | 'applications' | 'empty';
  onClearFilters?: () => void;
  onExplore?: () => void;
}

export const JobEmptyState: React.FC<Props> = ({
  type,
  onClearFilters,
  onExplore,
}) => {
  if (type === 'search') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          No opportunities match your current filters
        </h3>
        <p className="text-sm text-slate-500 mt-2 mb-4 leading-relaxed">
          Try adjusting your search criteria:
        </p>
        <ul className="text-xs text-slate-600 space-y-1.5 mb-6 inline-block text-left bg-slate-50 p-4 rounded-xl border border-slate-200/70 w-full max-w-sm">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Removing specific work mode or experience filters
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Broadening your location or searching for Remote roles
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Trying a different skill or general keyword
          </li>
        </ul>
        {onClearFilters && (
          <div>
            <Button variant="primary" size="sm" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'saved') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <BookmarkX className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No saved jobs yet</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Save opportunities you&apos;re interested in and come back to review or apply to them later.
        </p>
        {onExplore ? (
          <Button variant="primary" size="sm" onClick={onExplore}>
            Explore Jobs
          </Button>
        ) : (
          <Link href="/jobs">
            <Button variant="primary" size="sm">
              Explore Jobs
            </Button>
          </Link>
        )}
      </div>
    );
  }

  if (type === 'applications') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          You haven&apos;t applied to any jobs yet
        </h3>
        <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          When you find an opportunity that aligns with your skills and career direction, your
          application progress will appear here.
        </p>
        {onExplore ? (
          <Button variant="primary" size="sm" onClick={onExplore}>
            Explore Jobs
          </Button>
        ) : (
          <Link href="/jobs">
            <Button variant="primary" size="sm">
              Explore Jobs
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">No opportunities available</h3>
      <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
        New opportunities will appear here as they become available.
      </p>
      <Link href="/explore">
        <Button variant="primary" size="sm">
          Explore Career Paths
        </Button>
      </Link>
    </div>
  );
};
