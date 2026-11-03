'use client';

import React from 'react';
import Link from 'next/link';
import { CareerPath, CandidateCareerContext, CareerLevelDefinition } from '@/lib/careers/career-types';
import { FileText, CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';

export interface ProfileReadinessSectionProps {
  candidate: CandidateCareerContext | null;
  career?: CareerPath;
  levelData?: CareerLevelDefinition;
}

export const ProfileReadinessSection: React.FC<ProfileReadinessSectionProps> = ({
  candidate,
  career,
  levelData,
}) => {
  const hasResume = Boolean(
    candidate?.skills && candidate.skills.length > 0 && candidate?.education && candidate.education.length > 0
  );
  const skillsCount = candidate?.skills ? candidate.skills.length : 0;
  const experienceCount = candidate?.experience ? candidate.experience.length : 0;
  const projectCount = candidate?.projects ? candidate.projects.length : 0;
  const hasLinks = Boolean(candidate?.projects?.some((p) => p.githubUrl));

  const isHardware =
    career?.category === 'Electronics & Systems' || career?.domainType === 'hardware';
  const isSenior = levelData?.id === 'senior';
  const isMid = levelData?.id === 'mid';

  // Level- and domain-appropriate checklist
  let items = [
    {
      label: 'Resume & Educational Background',
      isDone: hasResume,
      status: hasResume ? '✓ Added' : '○ Incomplete',
      note: 'Profile essentials',
    },
    {
      label: isHardware
        ? 'Lab Measurements & Circuit Reports'
        : isSenior
        ? 'Architecture & System Case Studies'
        : 'Portfolio Projects / Practical Work',
      isDone: projectCount >= (isSenior ? 2 : 1),
      status: projectCount >= 1 ? `✓ ${projectCount} Added` : '○ Needs Evidence',
      note: isHardware ? 'Schematic & SPICE docs' : 'Verified competence',
    },
    {
      label: isHardware
        ? 'Hardware Firmware / Pinout Documentation'
        : isSenior
        ? 'Technical Leadership & Impact Evidence'
        : 'Repository / Public Work Linked',
      isDone: isSenior ? experienceCount >= 2 : hasLinks || projectCount > 0,
      status: (isSenior ? experienceCount >= 2 : hasLinks) ? '✓ Documented' : '○ Pending',
      note: 'Tangible proof',
    },
    {
      label: `Core Skills Verified (${isSenior ? '8+' : isMid ? '5+' : '3+'} Skills)`,
      isDone: skillsCount >= (isSenior ? 8 : isMid ? 5 : 3),
      status: `${skillsCount} Verified`,
      note: 'Proficiency match',
    },
    {
      label: 'Relevant Certifications',
      isDone: false,
      status: '○ Optional',
      note: 'Career booster',
    },
  ];

  return (
    <div
      id="profile-readiness"
      className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold font-display text-slate-900">
              Make Your Profile Job-Ready
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Complete your profile checklist to demonstrate verified readiness for{' '}
            <strong className="text-blue-600">{levelData?.label || 'this level'}</strong> in{' '}
            {career?.title || 'this career path'}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {levelData && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Checklist: {levelData.label}
            </span>
          )}
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors shrink-0"
          >
            <span>Update Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                {item.isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span className="font-semibold text-slate-800 leading-snug line-clamp-2">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 pl-6 block">{item.note}</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded self-start ${
                item.isDone
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                  : 'bg-slate-200/80 text-slate-600'
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
