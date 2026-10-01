import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm">
      <div className="h-6 bg-slate-100 rounded-lg w-1/4" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-50 rounded-xl flex items-center px-4 gap-4">
            <div className="w-1/4 h-3.5 bg-slate-200 rounded" />
            <div className="w-1/4 h-3.5 bg-slate-200 rounded" />
            <div className="w-1/4 h-3.5 bg-slate-200 rounded" />
            <div className="w-1/4 h-3.5 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="h-3.5 bg-slate-100 rounded-lg w-1/3" />
        <div className="w-8 h-8 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-200/80 rounded-lg w-1/2" />
      <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
    </div>
  );
};
