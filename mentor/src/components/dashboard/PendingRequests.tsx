import React from 'react';
import Link from 'next/link';
import { BookingListDTO } from '@backend/types/mentorship';
import { StatusBadge } from '../StatusBadge';
import { AlertCircle, Clock, Check, X } from 'lucide-react';

interface PendingRequestsProps {
  requests: BookingListDTO[];
  onActionComplete?: () => void;
}

export function PendingRequests({ requests, onActionComplete }: PendingRequestsProps) {
  if (requests.length === 0) return null;

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-amber-950 font-display">
            Action Required: Pending Requests
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
            {requests.length}
          </span>
        </div>
        <Link
          href="/mentorship/bookings?tab=pending"
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
        >
          View all requests
        </Link>
      </div>

      <div className="space-y-2.5">
        {requests.map((b) => {
          const start = new Date(b.scheduledStart);
          const formatted = `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

          return (
            <div
              key={b.id}
              className="bg-white rounded-xl p-3 border border-amber-200/80 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900 truncate">
                    {b.candidate.name}
                  </span>
                  <StatusBadge status={b.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {b.service.title} • {formatted}
                </p>
                {b.studentNotes && (
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-1">
                    &ldquo;{b.studentNotes}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/mentorship/bookings/${b.id}`}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                >
                  Review
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
