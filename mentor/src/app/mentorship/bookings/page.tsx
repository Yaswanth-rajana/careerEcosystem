'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MentorShell } from '@/components/MentorShell';
import { StatusBadge } from '@/components/StatusBadge';
import { CardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { BookingListDTO, PaginatedResult } from '@backend/types/mentorship';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  Video,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  User,
} from 'lucide-react';

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('tab') || 'upcoming';
  const [data, setData] = useState<PaginatedResult<BookingListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (targetPage: number = 1, targetTab: string = currentTab) => {
    setIsLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        tab: targetTab,
        page: String(targetPage),
        limit: '25',
      });
      if (search.trim()) {
        q.set('search', search.trim());
      }

      const res = await fetch(`/api/mentor/bookings?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to load bookings');
      const json = await res.json();
      setData(json);
      setPage(targetPage);
    } catch (err: any) {
      setError(err.message || 'Error loading bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1, currentTab);
  }, [currentTab]);

  const handleTabChange = (newTab: string) => {
    router.push(`/mentorship/bookings?tab=${newTab}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(1, currentTab);
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'pending', label: 'Pending / Action Req.' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <MentorShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Mentorship Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review candidate reservations, confirm requests, and launch sessions
            </p>
          </div>

          <Link
            href="/availability"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            Check Availability
          </Link>
        </div>

        {/* Tabs and search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  currentTab === tab.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={`No ${currentTab} bookings found`}
            description="Bookings matching this filter will show up here. Candidates can book active services through your public profile."
            actionText="View Weekly Availability"
            actionHref="/availability"
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((booking) => {
                const start = new Date(booking.scheduledStart);
                const dateStr = start.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                });
                const timeStr = start.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100 flex-shrink-0">
                            {booking.candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {booking.candidate.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate max-w-[180px]">
                              {booking.candidate.headline || booking.candidate.email}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={booking.status} size="sm" />
                      </div>

                      <div className="space-y-1.5 py-2.5 border-y border-slate-100 mb-3 text-xs">
                        <div className="flex items-center justify-between text-slate-800">
                          <span className="font-semibold text-slate-900">
                            {booking.service.title}
                          </span>
                          <span className="text-slate-500 font-medium">
                            {booking.service.duration} mins
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {dateStr} • {timeStr} ({booking.timezone})
                          </span>
                        </div>
                      </div>

                      {booking.studentNotes && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 line-clamp-2 italic mb-3">
                          &ldquo;{booking.studentNotes}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {booking.sessionId && (
                        <Link
                          href={`/mentorship/sessions/${booking.sessionId}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Session Workspace
                        </Link>
                      )}

                      <Link
                        href={`/mentorship/bookings/${booking.id}`}
                        className="inline-flex items-center justify-center py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {(page - 1) * data.limit + 1} to{' '}
                  {Math.min(page * data.limit, data.total)} of {data.total} bookings
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => fetchBookings(page - 1, currentTab)}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-700 px-2">
                    {page} / {data.totalPages}
                  </span>
                  <button
                    disabled={page >= data.totalPages}
                    onClick={() => fetchBookings(page + 1, currentTab)}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MentorShell>
  );
}

export default function MentorBookingsPage() {
  return (
    <React.Suspense
      fallback={
        <MentorShell>
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </MentorShell>
      }
    >
      <BookingsContent />
    </React.Suspense>
  );
}
