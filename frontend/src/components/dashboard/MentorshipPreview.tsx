'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Calendar, Clock, UserCheck, Users } from 'lucide-react';
import { DashboardMentorshipDTO } from '@backend/types/dashboard';
import { Button } from '@/components/design-system/Button';

interface MentorshipPreviewProps {
  mentorship: DashboardMentorshipDTO;
  onRefresh?: () => Promise<void> | void;
}

function formatSessionDateTime(
  isoStart: string | undefined,
  isoEnd: string | undefined,
  timezone: string | undefined
): { dateStr: string; timeStr: string } {
  if (!isoStart) return { dateStr: '', timeStr: '' };
  try {
    const start = new Date(isoStart);
    const end = isoEnd ? new Date(isoEnd) : null;
    const tz = timezone || 'Asia/Kolkata';

    const dateStr = start.toLocaleDateString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timeStart = start.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (end) {
      const timeEnd = end.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return {
        dateStr,
        timeStr: `${timeStart} – ${timeEnd} (${tz})`,
      };
    }

    return {
      dateStr,
      timeStr: `${timeStart} (${tz})`,
    };
  } catch {
    return {
      dateStr: isoStart ? isoStart.slice(0, 10) : '',
      timeStr: timezone ? `(${timezone})` : '',
    };
  }
}

export const MentorshipPreview: React.FC<MentorshipPreviewProps> = ({ mentorship, onRefresh }) => {
  const [now, setNow] = useState(() => Date.now());
  const lastFocusRefreshRef = useRef<number>(0);

  // Keep a local tick or revalidate when window/tab regains focus
  useEffect(() => {
    const handleRevalidate = () => {
      // Ignore if document is currently hidden
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      const currentTime = Date.now();
      setNow(currentTime);

      // Prevent duplicate revalidation when visibilitychange and focus fire together
      if (currentTime - lastFocusRefreshRef.current < 2000) {
        return;
      }
      lastFocusRefreshRef.current = currentTime;

      if (onRefresh) {
        onRefresh();
      }
    };

    window.addEventListener('focus', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    return () => {
      window.removeEventListener('focus', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
    };
  }, [onRefresh]);

  // Set precise timer to expire session when scheduledEnd is reached
  useEffect(() => {
    if (!mentorship.hasSession || !mentorship.upcomingSession?.scheduledEnd) return;

    const endMs = new Date(mentorship.upcomingSession.scheduledEnd).getTime() - Date.now();
    if (endMs <= 0) {
      setNow(Date.now());
      if (onRefresh) onRefresh();
      return;
    }

    const endTimer = setTimeout(() => {
      setNow(Date.now());
      if (onRefresh) onRefresh();
    }, endMs);

    // Also trigger update when session starts to transition from upcoming to live
    let startTimer: NodeJS.Timeout | null = null;
    if (mentorship.upcomingSession.scheduledStart) {
      const startMs = new Date(mentorship.upcomingSession.scheduledStart).getTime() - Date.now();
      if (startMs > 0) {
        startTimer = setTimeout(() => {
          setNow(Date.now());
          if (onRefresh) onRefresh();
        }, startMs);
      }
    }

    return () => {
      clearTimeout(endTimer);
      if (startTimer) clearTimeout(startTimer);
    };
  }, [mentorship.hasSession, mentorship.upcomingSession?.scheduledEnd, mentorship.upcomingSession?.scheduledStart, onRefresh]);

  const session = mentorship.upcomingSession;
  const isEnded = session?.scheduledEnd ? new Date(session.scheduledEnd).getTime() <= now : false;

  // If no session is booked or the session has ended, show the original Find a Mentor card
  if (!mentorship.hasSession || !session || isEnded) {
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
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Verified industry mentors</span>
          <Link href="/mentors" className="text-blue-600 font-semibold hover:underline">
            Book session →
          </Link>
        </div>
      </div>
    );
  }

  // A confirmed, ongoing or upcoming session exists
  const isOngoing =
    session.isOngoing ||
    (session.scheduledStart && session.scheduledEnd
      ? now >= new Date(session.scheduledStart).getTime() &&
        now < new Date(session.scheduledEnd).getTime()
      : false);

  const { dateStr, timeStr } = formatSessionDateTime(
    session.scheduledStart,
    session.scheduledEnd,
    session.timezone
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        {/* Header: Mentor Session & Link to Bookings */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
              Mentor Session
            </h3>
          </div>
          <Link
            href="/mentors/bookings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Booked Session Card Content */}
        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/70 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            {isOngoing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Confirmed Session
              </span>
            )}
            {session.timezone && (
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {session.timezone}
              </span>
            )}
          </div>

          {/* Mentor Profile Info */}
          <div className="flex items-start gap-3">
            {session.mentorAvatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                <Image
                  src={session.mentorAvatar}
                  alt={session.mentorName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                {session.mentorName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0F172A] truncate">
                {session.mentorName}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {session.mentorRole}
                {session.mentorCompany ? ` · ${session.mentorCompany}` : ''}
              </p>
            </div>
          </div>

          {/* Session Title if available */}
          {session.sessionTitle && (
            <div className="text-xs font-medium text-slate-700 bg-white/80 border border-slate-200/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{session.sessionTitle}</span>
            </div>
          )}

          {/* Date & Time in Correct Timezone */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{dateStr || session.scheduledAt}</span>
            </div>
            {timeStr && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{timeStr}</span>
              </div>
            )}
          </div>

          {/* Action Button: View Booking Details */}
          <div className="pt-1">
            <Link
              href={`/mentors/bookings/${session.bookingId || session.id}?from=dashboard`}
              className="block w-full"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-semibold"
              >
                View
              </Button>
            </Link>
          </div>
        </div>
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
