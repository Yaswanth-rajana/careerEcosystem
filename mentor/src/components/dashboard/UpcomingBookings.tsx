import React from 'react';
import Link from 'next/link';
import { BookingListDTO } from '@backend/types/mentorship';
import { SessionCard } from './SessionCard';
import { EmptyState } from '../EmptyState';
import { Calendar } from 'lucide-react';

export function UpcomingBookings({ bookings }: { bookings: BookingListDTO[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900 font-display">
            Upcoming Bookings
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {bookings.length}
          </span>
        </div>
        <Link
          href="/mentorship/bookings?tab=upcoming"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
        >
          View all bookings →
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming bookings"
          description="Your upcoming mentorship sessions will appear here as soon as candidates book time on your calendar."
          actionText="Review Services"
          actionHref="/mentorship/services"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <SessionCard key={booking.id} booking={booking} isToday={false} />
          ))}
        </div>
      )}
    </div>
  );
}
