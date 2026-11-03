'use client';

import React from 'react';
import Link from 'next/link';
import { CareerPath, CandidateCareerContext, CareerLevelId, CareerLevelDefinition } from '@/lib/careers/career-types';
import { getMatchingJobsForCandidate } from '@/lib/careers/career-repository';
import { Briefcase, MapPin, Building2, ArrowRight, Info, Sparkles } from 'lucide-react';

export interface CareerOpportunitiesSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
  selectedLevel?: CareerLevelId;
  levelData?: CareerLevelDefinition;
}

export const CareerOpportunitiesSection: React.FC<CareerOpportunitiesSectionProps> = ({
  career,
  candidate,
  selectedLevel = 'entry',
  levelData,
}) => {
  const jobs = getMatchingJobsForCandidate({
    candidate,
    careerSlug: career.slug,
    levelId: selectedLevel,
  });

  const experienceParam =
    selectedLevel === 'senior'
      ? '5+ years'
      : selectedLevel === 'mid'
      ? '3-5 years'
      : selectedLevel === 'junior'
      ? '1-3 years'
      : '0-1 years';

  return (
    <div id="matching-jobs" className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Matching Opportunities
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Openings matching your {career.title} path filtered for{' '}
            <strong className="text-blue-600">{levelData?.label || 'Target Level'}</strong>.
          </p>
        </div>

        <Link
          href={`/jobs?q=${encodeURIComponent(career.title)}&experienceLevel=${encodeURIComponent(
            experienceParam
          )}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shrink-0 transition-colors"
        >
          <span>View All Matching Jobs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Target Level Ambition vs Actual Experience Transparency Note */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-800">
            Showing opportunities aligned with target: {levelData?.label || 'Selected Level'} ({levelData?.experienceRange || '0-1 yrs'}).
          </span>{' '}
          Selecting a target level personalizes your roadmap and learning criteria. Employer candidate evaluation will assess your actual verified profile experience and skills.
        </div>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {job.company}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 shrink-0">
                    {job.salary}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.location}</span>
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    Experience Range: <strong>{job.experienceLevel}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/jobs?q=${encodeURIComponent(job.title)}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 py-2 rounded-xl bg-blue-50/70 border border-blue-200/60 transition-colors"
                >
                  <span>Explore Role in Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-800">No active postings match this exact filter currently.</p>
          <p className="text-xs text-slate-500">
            Check the main Jobs portal for upcoming roles or set your alert preferences.
          </p>
        </div>
      )}
    </div>
  );
};
