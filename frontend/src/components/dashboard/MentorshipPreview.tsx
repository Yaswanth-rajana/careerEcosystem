import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, UserCheck, Users } from 'lucide-react';
import { DashboardMentorshipDTO } from '@backend/types/dashboard';
import { Button } from '@/components/design-system/Button';

interface MentorshipPreviewProps {
  mentorship: DashboardMentorshipDTO;
}

export const MentorshipPreview: React.FC<MentorshipPreviewProps> = ({ mentorship }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
              Find a Mentor
            </h3>
          </div>
          <Link
            href="/mentors"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>All Mentors</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {mentorship.hasSession && mentorship.upcomingSession ? (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700">Upcoming Session</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {mentorship.upcomingSession.scheduledAt}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">
                {mentorship.upcomingSession.mentorName}
              </p>
              <p className="text-xs text-slate-600">
                {mentorship.upcomingSession.mentorRole}
              </p>
            </div>
            <Link href={mentorship.upcomingSession.sessionHref}>
              <Button variant="primary" size="sm" className="w-full">
                View Session Details
              </Button>
            </Link>
          </div>
        ) : (
          <div className="py-6 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A]">
                {mentorship.emptyState.title}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {mentorship.emptyState.description}
              </p>
            </div>
            <div className="pt-2">
              <Link href={mentorship.emptyState.actionHref}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {mentorship.emptyState.actionLabel.replace(/[→\s]+$/, '')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Verified industry mentors</span>
        <Link href="/mentors" className="text-blue-600 font-semibold hover:underline">
          Book session →
        </Link>
      </div>
    </div>
  );
};
