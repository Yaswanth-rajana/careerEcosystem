'use client';

import React from 'react';

export const MentorSkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="w-28 h-4 rounded bg-slate-200" />
            <div className="w-36 h-3 rounded bg-slate-200" />
          </div>
        </div>
        <div className="w-20 h-5 rounded-full bg-slate-200" />
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="w-full h-3 rounded bg-slate-200" />
        <div className="w-4/5 h-3 rounded bg-slate-200" />
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <div className="w-16 h-6 rounded-md bg-slate-200" />
        <div className="w-20 h-6 rounded-md bg-slate-200" />
        <div className="w-14 h-6 rounded-md bg-slate-200" />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-24 h-4 rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="w-20 h-8 rounded-xl bg-slate-200" />
          <div className="w-16 h-8 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export const MentorGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <MentorSkeletonCard key={idx} />
      ))}
    </div>
  );
};
