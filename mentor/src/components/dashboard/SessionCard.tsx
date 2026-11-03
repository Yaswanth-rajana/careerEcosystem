import React from 'react';
import Link from 'next/link';
import { BookingListDTO } from '@backend/types/mentorship';
import { StatusBadge } from '../StatusBadge';
import { Clock } from 'lucide-react';

interface SessionCardProps {
  booking: BookingListDTO;
  isToday?: boolean;
}

export function SessionCard({ booking, isToday = false }: SessionCardProps) {
  const start = new Date(booking.scheduledStart);
  const timeFormatted = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = start.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-slate-300 hover:shadow-sm transition group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-100 flex-shrink-0">
            {booking.candidate.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
              {booking.candidate.name}
            </h4>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">
              {booking.candidate.headline || booking.candidate.candidateType || 'Candidate'}
            </p>
          </div>
        </div>

        <StatusBadge status={booking.status} size="sm" />
      </div>

      <div className="space-y-1.5 py-2 border-y border-slate-100 my-2 text-xs">
        <div className="flex items-center justify-between text-slate-700">
          <span className="font-medium text-slate-900">{booking.service.title}</span>
          <span className="text-slate-500">{booking.service.duration} mins</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{isToday ? `Today at ${timeFormatted}` : `${dateFormatted} at ${timeFormatted}`}</span>
        </div>
      </div>

      {booking.studentNotes && (
        <div className="mb-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 line-clamp-2 italic">
          &ldquo;{booking.studentNotes}&rdquo;
        </div>
      )}

      <div className="pt-1">
        <Link
          href={`/mentorship/bookings/${booking.id}?from=dashboard`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          <span>View</span>
        </Link>
      </div>
    </div>
  );
}
