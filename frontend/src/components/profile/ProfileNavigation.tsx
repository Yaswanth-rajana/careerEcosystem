'use client';

import React from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Cpu,
  FolderGit2,
  Compass,
  SlidersHorizontal,
  Link2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileCompletionDTO } from '@backend/types/profile';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PROFILE_NAV_ITEMS: NavItem[] = [
  { key: 'personal', label: 'Personal Information', icon: User },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'skills', label: 'Skills & Expertise', icon: Cpu },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'careerDirection', label: 'Career Direction', icon: Compass },
  { key: 'preferences', label: 'Job Preferences', icon: SlidersHorizontal },
  { key: 'linksAndCertifications', label: 'Links & Certifications', icon: Link2 },
  { key: 'account', label: 'Account & Security', icon: ShieldCheck },
];

interface ProfileNavigationProps {
  activeSection: string;
  onSelectSection: (key: string) => void;
  completion: ProfileCompletionDTO;
  counts?: Record<string, number>;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeSection,
  onSelectSection,
  completion,
  counts,
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Mobile Horizontal Scrollable Pill Bar */}
      <div className="flex lg:hidden overflow-x-auto pb-3 gap-2 no-scrollbar">
        {PROFILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSection(item.key)}
              className={cn(
                'whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border',
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Navigation Menu */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Profile Sections
        </div>

        {PROFILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;
          const isComplete = completion.completedSections.includes(item.key);
          const count = counts?.[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSection(item.key)}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left group',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-md font-bold',
                      isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {count}
                  </span>
                )}
                {isComplete && (
                  <span title="Section Completed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
