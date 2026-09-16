'use client';

import React from 'react';
import Link from 'next/link';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { getMatchingJobsForCandidate } from '@/lib/careers/career-repository';
import { Briefcase, MapPin, Building2, ArrowRight } from 'lucide-react';

export interface CareerOpportunitiesSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const CareerOpportunitiesSection: React.FC<CareerOpportunitiesSectionProps> = ({
  career,
  candidate,
}) => {
  const jobs = getMatchingJobsForCandidate({ candidate, careerSlug: career.slug });

  return (
    <div id="matching-jobs" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Matching Opportunities
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Roles matching your {career.title} path and skills.
          </p>
        </div>

        <Link
          href={`/jobs?search=${encodeURIComponent(career.title)}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-bold shadow-xs shrink-0 hover:opacity-95 transition-opacity"
        >
          <span>View Matching Jobs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#6366F1]/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#6366F1]" />
                    {job.company}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  {job.salary}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </p>
                <p className="text-[11px]">Experience: {job.experienceLevel}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <Link
                href={`/jobs?role=${encodeURIComponent(job.title)}`}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#6366F1] dark:text-[#818CF8] hover:text-white hover:bg-[#6366F1] py-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
              >
                <span>View Role Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
