'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Plus, Building2, Bell, ExternalLink } from 'lucide-react';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';

interface RecruiterHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const RecruiterHeader: React.FC<RecruiterHeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
}) => {
  const { recruiterData } = useRecruiterAuth();
  const company = recruiterData?.company;
  const user = recruiterData?.user;

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title ? (
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight sm:text-xl font-heading">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-700">
              {company?.name || 'Recruiter Workspace'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Post Job Quick Action */}
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Create Job</span>
        </Link>

        {/* Company Badge */}
        {company && (
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium truncate max-w-[140px]">{company.name}</span>
          </div>
        )}

        {/* User Mini Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-slate-900 leading-tight">
              {user?.name || 'Recruiter'}
            </p>
            <p className="text-[10px] text-slate-500 capitalize leading-tight">
              {recruiterData?.companyRole?.toLowerCase().replace('_', ' ') || 'Recruiter'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
