'use client';

import React from 'react';
import { CareerPath, CandidateCareerContext } from '@/lib/careers/career-types';
import { calculateCareerProgress } from '@/lib/careers/career-repository';
import { Activity, BookOpen, FolderGit2, Dumbbell, UserCheck, Users } from 'lucide-react';

export interface PersonalizedProgressSectionProps {
  career: CareerPath;
  candidate: CandidateCareerContext | null;
}

export const PersonalizedProgressSection: React.FC<PersonalizedProgressSectionProps> = ({
  career,
  candidate,
}) => {
  const metrics = calculateCareerProgress(candidate, career.slug);

  const bars = [
    { label: 'Learning', percent: metrics.learningPercent, icon: BookOpen, color: 'bg-blue-600' },
    { label: 'Projects', percent: metrics.projectsPercent, icon: FolderGit2, color: 'bg-blue-500' },
    { label: 'Practice', percent: metrics.practicePercent, icon: Dumbbell, color: 'bg-sky-500' },
    { label: 'Mentorship', percent: metrics.mentorshipPercent, icon: Users, color: 'bg-slate-700' },
    { label: 'Profile', percent: metrics.profilePercent, icon: UserCheck, color: 'bg-emerald-600' },
  ];

  return (
    <div id="career-progress" className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold font-display text-slate-900">
              Your Preparation Progress
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            How much of your PATHWAY preparation have you completed for {career.title}?
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600">
              {metrics.overallPathwayProgress}%
            </span>
            <span className="text-[10px] font-bold block text-slate-500 uppercase tracking-wider">
              Overall Progress
            </span>
          </div>
        </div>
      </div>

      {/* Progress Breakdown Bars across 5 dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {bars.map((item) => {
          const IconComp = item.icon;
          return (
            <div key={item.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <IconComp className="w-3.5 h-3.5 text-blue-600" />
                  {item.label}
                </span>
                <span className="font-mono font-bold text-slate-900">{item.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  style={{ width: `${item.percent}%` }}
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
