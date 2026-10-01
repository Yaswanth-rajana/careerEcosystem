import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { Card } from '@/components/design-system/Card';

interface DashboardHeaderProps {
  userName: string;
  targetRole: string | null;
  careerField: string | null;
  profileCompletionPercentage: number;
  nextProfileSection: string | null;
  isProfileComplete: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  targetRole,
  careerField,
  profileCompletionPercentage,
  nextProfileSection,
  isProfileComplete,
}) => {
  // Determine time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName ? userName.split(' ')[0] : 'there';
  const roleSubtitle = [targetRole, careerField].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
      {/* Greeting and Career Direction */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personal Career Command Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-[#0F172A]">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          {roleSubtitle || 'Your career journey starts with the next right step.'}
        </p>
      </div>

      {/* Profile Completion Card */}
      <Card className="w-full md:w-80 p-4 border border-slate-200/80 bg-white shadow-sm rounded-2xl shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {isProfileComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <UserCheck className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-xs font-bold text-[#0F172A] tracking-tight">
              {isProfileComplete ? 'Profile Complete' : `Profile ${profileCompletionPercentage}%`}
            </span>
          </div>
          <Link
            href="/profile"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5 group"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Progress bar */}
        {!isProfileComplete && (
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(profileCompletionPercentage, 100)}%` }}
              />
            </div>
            {nextProfileSection && (
              <p className="text-[11px] text-slate-500 truncate">
                Next: <span className="font-semibold text-slate-700">Add {nextProfileSection}</span>
              </p>
            )}
          </div>
        )}

        {isProfileComplete && (
          <p className="text-[11px] text-emerald-700 font-medium">
            Your profile is fully verified and optimized for opportunities.
          </p>
        )}
      </Card>
    </div>
  );
};
