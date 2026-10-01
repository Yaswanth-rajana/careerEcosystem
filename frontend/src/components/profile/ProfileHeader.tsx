'use client';

import React from 'react';
import { MapPin, Briefcase, Sparkles, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { Badge } from '@/components/design-system/Badge';
import { ProfileCoreDTO } from '@backend/types/profile';

interface ProfileHeaderProps {
  core: ProfileCoreDTO;
  onNavigateSection: (sectionKey: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ core, onNavigateSection }) => {
  const { personal, careerDirection, completion } = core;
  const initial = personal.name ? personal.name.charAt(0).toUpperCase() : 'U';

  const sectionLabelMap: Record<string, string> = {
    personal: 'Personal Information',
    education: 'Education',
    experience: 'Experience',
    skills: 'Skills',
    projects: 'Projects',
    careerDirection: 'Career Direction',
    preferences: 'Job Preferences',
    linksAndCertifications: 'Links & Certifications',
  };

  const nextLabel = sectionLabelMap[completion.nextSection] || completion.nextSection;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            {personal.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={personal.avatarUrl}
                alt={personal.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-white">
                {initial}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-slate-200">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block" title="Active Account" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                {personal.name}
              </h1>
              <Badge variant="brand" size="sm">
                {personal.candidateType || 'CANDIDATE'}
              </Badge>
            </div>

            <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{personal.headline || careerDirection?.targetRole || 'Candidate Profile'}</span>
            </p>

            {personal.location && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{personal.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Canonical Profile Completion Widget */}
        <div className="w-full md:w-72 bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Profile Strength
            </span>
            <span className="text-blue-600 font-extrabold text-sm">{completion.percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(5, completion.percentage))}%` }}
            />
          </div>

          {/* Action / Next section */}
          {completion.percentage < 100 && completion.nextSection !== 'complete' ? (
            <button
              type="button"
              onClick={() => onNavigateSection(completion.nextSection)}
              className="w-full text-left text-xs text-slate-600 hover:text-blue-600 flex items-center justify-between pt-1 transition-colors group"
            >
              <span className="truncate">
                Next: <strong className="text-slate-800 group-hover:text-blue-600">{nextLabel}</strong>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All core sections completed!
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
