import React from 'react';

export const JobListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 w-full">
              <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-2 w-full max-w-md">
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div className="h-6 w-16 bg-slate-100 rounded-full" />
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-6 w-24 bg-slate-100 rounded-full" />
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="h-5 w-12 bg-slate-100 rounded" />
            <div className="h-5 w-14 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
