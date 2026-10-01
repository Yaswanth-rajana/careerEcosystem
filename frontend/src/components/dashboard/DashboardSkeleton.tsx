import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-3">
          <div className="h-8 w-64 sm:w-80 bg-slate-200 rounded-xl" />
          <div className="h-4 w-48 sm:w-60 bg-slate-200/80 rounded-lg" />
        </div>
        <div className="w-full md:w-72 h-20 bg-slate-200 rounded-2xl" />
      </div>

      {/* Your Next Step Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-40 w-full bg-slate-200/80 rounded-2xl" />
      </div>

      {/* Career Journey Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-28 w-full bg-slate-200/80 rounded-2xl" />
      </div>

      {/* Grid Row: Snapshot & Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200/80 rounded-2xl" />
        <div className="h-64 bg-slate-200/80 rounded-2xl" />
      </div>

      {/* Opportunities Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="h-44 w-full bg-slate-200/80 rounded-2xl" />
      </div>

      {/* Mentorship & Interview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 bg-slate-200/80 rounded-2xl" />
        <div className="h-48 bg-slate-200/80 rounded-2xl" />
      </div>
    </div>
  );
};
