'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { useAuth } from '@/lib/AuthContext';
import { CandidateBooking, AvailableSlot } from '@/lib/mentors/mentor-types';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarX,
  Sparkles,
} from 'lucide-react';

function formatBookingDateTime(isoStart: string, isoEnd: string, timezone: string): {
  dateStr: string;
  timeStr: string;
} {
  try {
    const start = new Date(isoStart);
    const end = new Date(isoEnd);

    const dateStr = start.toLocaleDateString('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timeStart = start.toLocaleTimeString('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const timeEnd = end.toLocaleTimeString('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      dateStr,
      timeStr: `${timeStart} – ${timeEnd}`,
    };
  } catch {
    return {
      dateStr: isoStart ? isoStart.slice(0, 10) : '',
      timeStr: '',
    };
  }
}

function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

function formatSlotDisplay(displayTime: string): string {
  if (!displayTime) return '';
  const parts = displayTime.split(' - ');
  if (parts.length === 2) {
    return `${formatTime12h(parts[0])} – ${formatTime12h(parts[1])}`;
  }
  return displayTime;
}

function getQuickDates(): Array<{
  dateStr: string;
  label: string;
  dayOfWeek: string;
  dayNum: string;
  monthStr: string;
}> {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = String(d.getDate());
    const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
    dates.push({
      dateStr,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dayOfWeek}, ${monthStr} ${dayNum}`,
      dayOfWeek,
      dayNum,
      monthStr,
    });
  }
  return dates;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Confirmed
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'CANCELLED_BY_CANDIDATE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          Cancelled by you
        </span>
      );
    case 'CANCELLED_BY_MENTOR':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Cancelled by mentor
        </span>
      );
    case 'RESCHEDULE_REQUESTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Reschedule Requested
        </span>
      );
    case 'NO_SHOW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
          No Show
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}

function CandidateBookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const tabParam = (searchParams.get('tab') as 'upcoming' | 'past' | 'cancelled') || 'upcoming';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>(tabParam);
  const [page, setPage] = useState(pageParam);
  const [bookings, setBookings] = useState<CandidateBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<CandidateBooking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentors/bookings?tab=${activeTab}&page=${page}&limit=10`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?from=/mentors/bookings`);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load mentorship bookings');
      }
      const data = await res.json();
      setBookings(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading your bookings.');
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTab, page, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/mentors/bookings');
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, fetchBookings, router]);

  const handleTabChange = (newTab: 'upcoming' | 'past' | 'cancelled') => {
    setActiveTab(newTab);
    setPage(1);
    setActionSuccess(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    params.set('page', '1');
    router.replace(`/mentors/bookings?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.replace(`/mentors/bookings?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCancelModal = (booking: CandidateBooking) => {
    setCancellingBooking(booking);
    setCancelReason('');
    setCancelError(null);
  };

  const handleCloseCancelModal = () => {
    if (isCancelling) return;
    setCancellingBooking(null);
    setCancelReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/mentors/bookings/${cancellingBooking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      setActionSuccess(`Your booking with ${cancellingBooking.mentor.name} has been cancelled.`);
      setCancellingBooking(null);
      // Refresh current list of bookings
      await fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'An error occurred while cancelling your booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Reschedule Modal State
  const [reschedulingBooking, setReschedulingBooking] = useState<CandidateBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [rescheduleMentorTimezone, setRescheduleMentorTimezone] = useState<string>('Asia/Kolkata');
  const [rescheduleNote, setRescheduleNote] = useState<string>('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState<boolean>(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const fetchReplacementSlots = useCallback(
    async (mId: string, sId: string, dateStr: string) => {
      if (!mId || !sId || !dateStr) return;
      setIsLoadingSlots(true);
      setSlotsError(null);
      setSelectedSlot(null);

      try {
        const res = await fetch(`/api/mentors/${mId}/slots?serviceId=${sId}&date=${dateStr}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to retrieve available slots');
        }
        setAvailableSlots(data.slots || []);
        if (data.timezone) {
          setRescheduleMentorTimezone(data.timezone);
        }
      } catch (err: any) {
        setSlotsError(err.message || 'Unable to load slots for this date');
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    },
    []
  );

  const handleOpenRescheduleModal = (booking: CandidateBooking) => {
    setReschedulingBooking(booking);
    setSelectedSlot(null);
    setRescheduleNote('');
    setRescheduleError(null);
    setSlotsError(null);

    // Default to tomorrow or today
    const tomorrow = new Date(Date.now() + 86400000);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const initialDate = `${y}-${m}-${d}`;
    setRescheduleDate(initialDate);
    fetchReplacementSlots(booking.mentor.id, booking.service.id, initialDate);
  };

  const handleCloseRescheduleModal = () => {
    if (isSubmittingReschedule) return;
    setReschedulingBooking(null);
    setSelectedSlot(null);
    setRescheduleNote('');
    setRescheduleError(null);
    setSlotsError(null);
    setAvailableSlots([]);
  };

  const handleDateSelect = (dateStr: string) => {
    setRescheduleDate(dateStr);
    if (reschedulingBooking) {
      fetchReplacementSlots(reschedulingBooking.mentor.id, reschedulingBooking.service.id, dateStr);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingBooking || !selectedSlot) return;
    setIsSubmittingReschedule(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/mentors/bookings/${reschedulingBooking.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledStart: selectedSlot.start,
          timezone: rescheduleMentorTimezone,
          studentNotes: rescheduleNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit reschedule request');
      }

      setActionSuccess(
        `Reschedule request submitted for your session with ${reschedulingBooking.mentor.name}. Awaiting mentor confirmation.`
      );
      setReschedulingBooking(null);
      await fetchBookings();
    } catch (err: any) {
      setRescheduleError(err.message || 'An error occurred while rescheduling your booking.');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFC] text-slate-900 font-sans">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Top Breadcrumb & Heading */}
        <div className="space-y-4 mb-8">
          <Link
            href="/mentors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Mentors Discovery
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                My Mentorship Sessions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your 1-on-1 private mentorship sessions, join video rooms, and track session status.
              </p>
            </div>

            <Link href="/mentors">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-sm"
              >
                Book New Mentor
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200/60 mb-6 w-fit text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabChange('upcoming')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Upcoming Sessions</span>
            {activeTab === 'upcoming' && total > 0 && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                {total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('past')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Past Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('cancelled')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'cancelled'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>Cancelled</span>
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-white border border-rose-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Failed to load bookings</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <CalendarX className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-slate-900">
                {activeTab === 'upcoming'
                  ? 'No upcoming mentorship sessions'
                  : activeTab === 'past'
                  ? 'No past sessions on record'
                  : 'No cancelled sessions'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'upcoming'
                  ? 'Book personalized 1-on-1 career direction, architecture deep dives, or mock interviews with top industry mentors.'
                  : activeTab === 'past'
                  ? 'Sessions you complete will appear here along with mentor feedback and action notes.'
                  : 'You have no cancelled mentorship bookings.'}
              </p>
            </div>
            {activeTab === 'upcoming' && (
              <div className="pt-2">
                <Link href="/mentors">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Find a Mentor
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const { dateStr, timeStr } = formatBookingDateTime(
                booking.scheduledStart,
                booking.scheduledEnd,
                booking.timezone
              );

              return (
                <div
                  key={booking.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Header: Mentor Details & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <Image
                          src={booking.mentor.avatar}
                          alt={booking.mentor.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold font-display text-slate-900">
                            {booking.mentor.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-slate-500">
                          {booking.mentor.headline}
                          {booking.mentor.company ? ` · ${booking.mentor.company}` : ''}
                        </p>
                      </div>
                    </div>

                    <div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>

                  {/* Service & Time Schedule Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Service
                      </span>
                      <p className="font-bold text-slate-900">{booking.service.title}</p>
                      <p className="text-slate-500">
                        {booking.service.duration} mins ·{' '}
                        {booking.service.price === 0
                          ? 'Free'
                          : `₹${booking.service.price.toLocaleString()}`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Scheduled Time
                      </span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {dateStr}
                      </p>
                      <p className="text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {timeStr} ({booking.timezone})
                      </p>
                    </div>
                  </div>

                  {/* Student Notes if any */}
                  {booking.studentNotes && (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Your Focus Topic: </span>
                      <span className="italic text-slate-600">{booking.studentNotes}</span>
                    </div>
                  )}

                  {/* Cancellation Reason if cancelled */}
                  {booking.cancellationReason && (
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 text-xs text-rose-800">
                      <span className="font-bold">Cancellation Reason: </span>
                      <span>{booking.cancellationReason}</span>
                    </div>
                  )}

                  {/* Reschedule Requested Notice */}
                  {booking.status === 'RESCHEDULE_REQUESTED' && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-800 space-y-1">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Reschedule Awaiting Mentor Approval: </span>
                          <span>
                            You requested a new session time. Your replacement slot is held while awaiting your mentor&apos;s confirmation.
                          </span>
                        </div>
                      </div>
                      {booking.rescheduledStart && (
                        <div className="pl-6 pt-1 text-[11px] text-amber-900 font-medium">
                          <span className="text-amber-700">Proposed New Time: </span>
                          {new Date(booking.rescheduledStart).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(booking.rescheduledStart).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' • '}
                          <span className="text-amber-700">Current Confirmed: </span>
                          {new Date(booking.scheduledStart).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(booking.scheduledStart).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                    <div className="text-[11px] text-slate-400">
                      Booked on{' '}
                      {new Date(booking.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/mentors/bookings/${booking.id}?from=bookings`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <span>View</span>
                      </Link>

                      {booking.canReschedule && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRescheduleModal(booking)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-xs py-1.5 px-3"
                        >
                          Reschedule
                        </Button>
                      )}

                      {booking.canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCancelModal(booking)}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold text-xs py-1.5 px-3"
                        >
                          Cancel Session
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Showing page <strong className="text-slate-900">{page}</strong> of{' '}
                  <strong className="text-slate-900">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cancellation Confirmation Dialog */}
      <Modal
        isOpen={!!cancellingBooking}
        onClose={handleCloseCancelModal}
        title="Cancel Mentorship Booking"
        maxWidth="md"
      >
        {cancellingBooking && (
          <div className="space-y-5 text-left text-xs">
            {cancelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="space-y-1.5 text-slate-600">
              <p className="text-sm font-bold text-slate-900">
                Are you sure you want to cancel your session with{' '}
                <span className="text-blue-600">{cancellingBooking.mentor.name}</span>?
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cancelling will release your reserved slot so other candidates can book with this mentor.
                Your session video link will be deactivated.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
              <p><span className="font-semibold">Service:</span> {cancellingBooking.service.title}</p>
              <p>
                <span className="font-semibold">Scheduled Date:</span>{' '}
                {new Date(cancellingBooking.scheduledStart).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, resolved the issue independently..."
                rows={3}
                maxLength={500}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseCancelModal}
                disabled={isCancelling}
                className="text-xs"
              >
                Keep Booking
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Session'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Booking Dialog */}
      <Modal
        isOpen={!!reschedulingBooking}
        onClose={handleCloseRescheduleModal}
        title="Reschedule Mentorship Session"
        maxWidth="lg"
      >
        {reschedulingBooking && (
          <div className="space-y-5 text-left text-xs">
            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{rescheduleError}</span>
              </div>
            )}

            {/* Mentor & Current Booking Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 overflow-hidden relative border border-blue-200">
                  {reschedulingBooking.mentor.avatar ? (
                    <Image
                      src={reschedulingBooking.mentor.avatar}
                      alt={reschedulingBooking.mentor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    reschedulingBooking.mentor.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {reschedulingBooking.mentor.name}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {reschedulingBooking.service.title} ({reschedulingBooking.service.duration} mins)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Scheduled Time
                </span>
                <span className="font-semibold text-slate-700 text-xs">
                  {formatBookingDateTime(
                    reschedulingBooking.scheduledStart,
                    reschedulingBooking.scheduledEnd,
                    reschedulingBooking.timezone
                  ).dateStr}{' '}
                  ·{' '}
                  {formatBookingDateTime(
                    reschedulingBooking.scheduledStart,
                    reschedulingBooking.scheduledEnd,
                    reschedulingBooking.timezone
                  ).timeStr}
                </span>
              </div>
            </div>

            {/* Date Selection Bar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                Select Replacement Date
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {getQuickDates().map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => handleDateSelect(d.dateStr)}
                    className={`flex flex-col items-center px-3 py-2 rounded-xl text-center shrink-0 border transition-all ${
                      rescheduleDate === d.dateStr
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-80">{d.dayOfWeek}</span>
                    <span className="text-sm font-extrabold">{d.dayNum}</span>
                    <span className="text-[10px] opacity-80">{d.monthStr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                  Available Times ({rescheduleMentorTimezone})
                </label>
                {isLoadingSlots && (
                  <span className="text-[11px] text-blue-600 animate-pulse">Checking availability...</span>
                )}
              </div>

              {isLoadingSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : slotsError ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                  <span>{slotsError}</span>
                  <button
                    type="button"
                    onClick={() => handleDateSelect(rescheduleDate)}
                    className="underline font-bold ml-2"
                  >
                    Retry
                  </button>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                  <CalendarX className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-xs">No available slots on this date</p>
                  <p className="text-[11px] mt-0.5">Please choose another date above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-0.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    const isCurrentSlot =
                      new Date(reschedulingBooking.scheduledStart).getTime() ===
                      new Date(slot.start).getTime();

                    if (isCurrentSlot) return null; // Don't offer identical slot

                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        {formatSlotDisplay(slot.displayTime)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Note & Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                Notes for Mentor / Reason for Reschedule (Optional)
              </label>
              <textarea
                value={rescheduleNote}
                onChange={(e) => setRescheduleNote(e.target.value)}
                placeholder="e.g. Schedule conflict, would like to prepare more on system design..."
                rows={2}
                maxLength={500}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Preview & Approval Policy Notice */}
            {selectedSlot && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Proposed New Slot:</span>
                </div>
                <p className="text-xs font-semibold pl-6 text-slate-800">
                  {selectedSlot.date} · {formatSlotDisplay(selectedSlot.displayTime)} ({rescheduleMentorTimezone})
                </p>
                <p className="text-[11px] pl-6 text-slate-600 leading-relaxed">
                  Submitting this request will hold the replacement slot for you and request confirmation from {reschedulingBooking.mentor.name}.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseRescheduleModal}
                disabled={isSubmittingReschedule}
                className="text-xs"
              >
                Keep Current Time
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReschedule}
                disabled={!selectedSlot || isSubmittingReschedule}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                {isSubmittingReschedule ? 'Requesting...' : 'Request Reschedule'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}

export default function CandidateBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC]">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <CandidateBookingsContent />
    </Suspense>
  );
}
