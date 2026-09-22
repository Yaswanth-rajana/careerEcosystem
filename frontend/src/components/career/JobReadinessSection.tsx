'use client';

import React from 'react';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { calculateCareerProgress } from '@/lib/careers/career-repository';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface JobReadinessSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const JobReadinessSection: React.FC<JobReadinessSectionProps> = ({ career, candidate }) => {
  const metrics = calculateCareerProgress(candidate, career.slug);

  const bars = [
    { label: 'Skills', percent: metrics.learningPercent },
    { label: 'Projects', percent: metrics.projectsPercent },
    { label: 'Practice', percent: metrics.practicePercent },
    { label: 'Interview', percent: metrics.practicePercent },
    { label: 'Profile', percent: metrics.profilePercent },
  ];

  return (
    <div id="job-readiness" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 border border-indigo-200/80 shadow-md text-left space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-[#6366F1] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>JOB READINESS EVALUATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            Keep building until you&apos;re ready to apply.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your readiness score reflects your overall PATHWAY preparation completion across skills, projects, practice, and profile strength.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          <Link
            href="#matching-jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-black text-white text-xs font-bold shadow-md transition-opacity"
          >
            <span>Explore Matching Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-[11px] text-slate-500 font-medium">
            PATHWAY Activity Completion: <strong>{metrics.overallPathwayProgress}%</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
        {bars.map((b) => (
          <div key={b.label} className="p-3 rounded-xl bg-white/80 border border-slate-200/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{b.label}</span>
              <span className="font-mono font-bold text-slate-900">{b.percent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                style={{ width: `${b.percent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
