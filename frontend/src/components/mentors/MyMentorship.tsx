'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Bookmark, History, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/design-system/Button';
import { CandidateBooking } from '@/lib/mentors/mentor-types';

export const MyMentorship: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'saved'>('upcoming');
  const [bookings, setBookings] = useState<CandidateBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTabBookings = useCallback(async (tab: 'upcoming' | 'past') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mentors/bookings?tab=${tab}&limit=3`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.items || []);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && (activeTab === 'upcoming' || activeTab === 'past')) {
      fetchTabBookings(activeTab);
    } else {
      setBookings([]);
    }
  }, [user, activeTab, fetchTabBookings]);

  if (!user) {
    return null; // Only show for authenticated users
  }

  const handleScrollToDiscovery = () => {
    const el = document.getElementById('mentor-discovery');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="my-mentorship" className="py-12 border-b border-slate-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-slate-900">
                  My Mentorship Activity
                </h2>
                <Link
                  href="/mentors/bookings"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Manage All
                </Link>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your booked sessions, history, and scheduled video rooms.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/60 self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'past'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Past Sessions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Mentors</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {isLoading ? (
            <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((booking) => {
                  const startDate = new Date(booking.scheduledStart);
                  const dateStr = startDate.toLocaleDateString('en-US', {
                    timeZone: booking.timezone || 'Asia/Kolkata',
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                  const timeStr = startDate.toLocaleTimeString('en-US', {
                    timeZone: booking.timezone || 'Asia/Kolkata',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <div
                      key={booking.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <Image
                            src={booking.mentor.avatar}
                            alt={booking.mentor.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {booking.mentor.name}
                            </h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{booking.service.title}</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] space-y-1">
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {dateStr} · {timeStr}
                        </p>
                        <p className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {booking.service.duration} mins ({booking.timezone})
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {booking.status}
                        </span>

                        <Link
                          href={`/mentors/bookings/${booking.id}?from=mentors`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                        >
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-right pt-2">
                <Link
                  href="/mentors/bookings"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>View all mentorship sessions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Honest Empty State */
            <div className="py-12 text-center max-w-sm mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Your mentorship journey starts here.
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === 'upcoming' && "You haven't booked any mentorship sessions yet."}
                  {activeTab === 'past' && 'No completed session history available.'}
                  {activeTab === 'saved' && 'You have not saved any mentor profiles yet.'}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleScrollToDiscovery}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 shadow-sm"
              >
                Find a Mentor
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
