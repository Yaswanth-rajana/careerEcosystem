'use client';

import React from 'react';
import Link from 'next/link';
import { CandidateCareerContext } from '@/lib/careers/career-types';
import { FileText, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export interface ProfileReadinessSectionProps {
  candidate: CandidateCareerContext | null;
}

export const ProfileReadinessSection: React.FC<ProfileReadinessSectionProps> = ({ candidate }) => {
  const hasResume = candidate?.skills && candidate.skills.length > 0;
  const projectCount = candidate?.projects ? candidate.projects.length : 0;
  const hasGithub = candidate?.projects?.some((p) => p.githubUrl) || false;
  const hasPortfolio = false;
  const hasCertifications = false;

  const items = [
    { label: 'Resume Uploaded / Built', isDone: hasResume, status: hasResume ? '✓ Added' : '○ Not added' },
    { label: '2 Portfolio Projects', isDone: projectCount >= 2, status: `${projectCount} / 2 Completed` },
    { label: 'GitHub / Code Repository Linked', isDone: hasGithub, status: hasGithub ? '✓ Connected' : '○ Pending' },
    { label: 'Live Portfolio / Case Study', isDone: hasPortfolio, status: hasPortfolio ? '✓ Linked' : '○ Pending' },
    { label: 'Certifications Added (Optional)', isDone: hasCertifications, status: hasCertifications ? '✓ Added' : '○ Optional' },
  ];

  return (
    <div id="profile-readiness" className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm text-left space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Make Your Profile Job-Ready
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Complete your profile checklist to demonstrate verified candidate readiness to hiring managers.
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity shrink-0"
        >
          <span>Improve My Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between space-y-2 text-xs"
          >
            <div className="flex items-start gap-2">
              {item.isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{item.label}</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded self-start ${
                item.isDone
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
