import React from 'react';
import Link from 'next/link';
import { BookingListDTO } from '@backend/types/mentorship';
import { SessionCard } from './SessionCard';
import { EmptyState } from '../EmptyState';
import { Clock, Calendar } from 'lucide-react';

export function TodaySessions({ sessions }: { sessions: BookingListDTO[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          <h3 className="text-base font-bold text-slate-900 font-display">
            Today&apos;s Sessions
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {sessions.length}
          </span>
        </div>
        <Link
          href="/mentorship/bookings?tab=upcoming"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          View all upcoming →
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No sessions scheduled for today"
          description="You have no active mentorship sessions booked for today. Check upcoming bookings or review your weekly schedule."
          actionText="Manage Availability"
          actionHref="/availability"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((booking) => (
            <SessionCard key={booking.id} booking={booking} isToday={true} />
          ))}
        </div>
      )}
    </div>
  );
}
