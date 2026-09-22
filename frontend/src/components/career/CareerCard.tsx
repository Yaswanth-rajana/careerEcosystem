'use client';

import React from 'react';
import Link from 'next/link';
import { CareerPath } from '@/lib/careers/career-types';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface CareerCardProps {
  career: CareerPath;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  const topSkills = career.skillGroups.mustKnow.slice(0, 4);

  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left">
      <div className="space-y-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-blue-600" />
            {career.category}
          </span>
          {career.salaryRange?.formatted && (
            <span className="text-xs font-mono font-bold text-slate-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {career.salaryRange.formatted}
            </span>
          )}
        </div>

        {/* Title & 1-Line Description */}
        <div>
          <h3 className="text-xl font-bold font-display text-slate-900 group-hover:text-blue-600 transition-colors">
            {career.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
            {career.shortDescription}
          </p>
        </div>

        {/* 3-4 Key Skill Pills */}
        <div className="pt-1 flex flex-wrap gap-1.5">
          {topSkills.map((sk) => (
            <span
              key={sk.name}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
            >
              {sk.name}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          {career.typicalTrajectory?.[0] || 'Beginner-Friendly'}
        </span>
        <Link
          href={`/careers/${career.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
        >
          <span>Explore Career</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
