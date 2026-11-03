'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { useAuth } from '@/lib/AuthContext';
import { CandidateBooking, AvailableSlot } from '@/lib/mentors/mentor-types';
import {
  Calendar,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
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
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

function formatSlotDisplay(displayTime: string): string {
  if (!displayTime) return '';
  const parts = displayTime.split(' - ');
  if (parts.length === 2) {
    return `${formatTime12h(parts[0])} – ${formatTime12h(parts[1])}`;
  }
  return displayTime;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Confirmed
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'CANCELLED_BY_CANDIDATE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          Cancelled by you
        </span>
      );
    case 'CANCELLED_BY_MENTOR':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Cancelled by mentor
        </span>
      );
    case 'RESCHEDULE_REQUESTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          Reschedule Requested
        </span>
      );
    case 'NO_SHOW':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
          No Show
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}

function CandidateBookingDetailContent({ params }: { params?: { id: string } }) {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const bookingId = (params?.id || routeParams?.id || '') as string;
  const { user, isLoading: authLoading } = useAuth();

  const fromParam = searchParams?.get('from');
  const [fromSource, setFromSource] = useState<string | null>(fromParam || null);

  useEffect(() => {
    if (fromParam) {
      setFromSource(fromParam);
    } else if (typeof document !== 'undefined' && document.referrer) {
      if (document.referrer.includes('/dashboard')) {
        setFromSource('dashboard');
      } else if (document.referrer.includes('/mentors') && !document.referrer.includes('/mentors/bookings')) {
        setFromSource('mentors');
      }
    }
  }, [fromParam]);

  const backTarget = (() => {
    if (fromSource === 'dashboard') {
      return { href: '/dashboard', label: 'Back to Dashboard' };
    }
    if (fromSource === 'mentors') {
      return { href: '/mentors', label: 'Back to Mentors' };
    }
    return { href: '/mentors/bookings', label: 'Back to All Bookings' };
  })();

  const [booking, setBooking] = useState<CandidateBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentors/bookings/${bookingId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?from=/mentors/bookings/${bookingId}`);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to retrieve booking details');
      }
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
      } else {
        throw new Error(data.error || 'Booking not found');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading the booking.');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?from=/mentors/bookings/${bookingId}`);
      return;
    }
    if (user && bookingId) {
      fetchBooking();
    }
  }, [user, authLoading, fetchBooking, bookingId, router]);

  // Load slots for rescheduling
  const fetchAvailableSlots = useCallback(
    async (dateStr: string) => {
      if (!booking) return;
      setSlotsLoading(true);
      setRescheduleError(null);
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `/api/mentors/${booking.mentor.id}/slots?serviceId=${booking.service.id}&date=${dateStr}&days=1`
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load available time slots');
        }
        setAvailableSlots(data.slots || []);
      } catch (err: any) {
        setRescheduleError(err.message || 'Could not load slots.');
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [booking]
  );

  useEffect(() => {
    if (showRescheduleModal && booking) {
      fetchAvailableSlots(selectedDate);
    }
  }, [showRescheduleModal, selectedDate, fetchAvailableSlots, booking]);

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/mentors/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel booking.');
      }

      setShowCancelModal(false);
      setActionSuccess('Booking successfully cancelled.');
      setTimeout(() => setActionSuccess(null), 5000);
      await fetchBooking();
    } catch (err: any) {
      setCancelError(err.message || 'An error occurred while cancelling.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!booking || !selectedSlot) return;
    setIsRescheduling(true);
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/mentors/bookings/${booking.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledStart: selectedSlot.start,
          timezone: booking.timezone || 'Asia/Kolkata',
          studentNotes: rescheduleNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to request reschedule.');
      }

      setShowRescheduleModal(false);
      setActionSuccess('Reschedule request submitted. Awaiting mentor confirmation.');
      setTimeout(() => setActionSuccess(null), 6000);
      await fetchBooking();
    } catch (err: any) {
      setRescheduleError(err.message || 'An error occurred while rescheduling.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const changeDateBy = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    const minDate = new Date();
    if (cur < minDate) return;
    setSelectedDate(cur.toISOString().slice(0, 10));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-[#0F172A] font-sans antialiased">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="space-y-6">
          {/* Top Breadcrumb Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href={backTarget.href}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backTarget.label}</span>
            </Link>
          </div>

          {actionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-24 bg-slate-100 rounded-2xl" />
              <div className="h-10 bg-slate-200 rounded-xl w-1/4" />
            </div>
          ) : booking ? (
            (() => {
              const { dateStr, timeStr } = formatBookingDateTime(
                booking.scheduledStart,
                booking.scheduledEnd,
                booking.timezone
              );

              return (
                <div className="space-y-6">
                  {/* Main Details Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                    {/* Header: Title & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                            {booking.service.title}
                          </h1>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Booking ID: {booking.id}
                        </p>
                      </div>
                      <div>
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>

                    {/* Mentor Profile Overview */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <Image
                            src={booking.mentor.avatar}
                            alt={booking.mentor.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="text-base font-bold text-slate-900 font-display">
                              {booking.mentor.name}
                            </h2>
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-xs text-slate-600">
                            {booking.mentor.headline}
                            {booking.mentor.company ? ` · ${booking.mentor.company}` : ''}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/mentors/${booking.mentor.id}?fromBooking=${booking.id}${fromSource ? `&from=${fromSource}` : ''}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 shrink-0"
                      >
                        <span>View Mentor Profile</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Service & Time Schedule Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Scheduled Session Time
                        </span>
                        <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {dateStr}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {timeStr} ({booking.timezone})
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Mentorship Service
                        </span>
                        <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          {booking.service.title}
                        </p>
                        <p className="text-xs text-slate-600">
                          {booking.service.duration} mins •{' '}
                          {booking.service.price === 0
                            ? 'Free'
                            : `₹${booking.service.price.toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    {/* Reschedule Requested Notice Banner */}
                    {booking.status === 'RESCHEDULE_REQUESTED' && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Reschedule Pending Mentor Approval: </span>
                            <span>
                              You requested a new session time. Your replacement slot is reserved while awaiting mentor confirmation.
                            </span>
                          </div>
                        </div>
                        {booking.rescheduledStart && (
                          <div className="pl-7 text-xs text-amber-900 space-y-1">
                            <div>
                              <span className="font-semibold text-amber-700">Proposed New Time: </span>
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
                            </div>
                            <div>
                              <span className="font-semibold text-amber-700">Current Confirmed: </span>
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
                          </div>
                        )}
                      </div>
                    )}

                    {/* Student Notes / Focus Topic */}
                    {booking.studentNotes && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900">Your Discussion Topic / Notes:</span>
                        <p className="italic text-slate-600">{booking.studentNotes}</p>
                      </div>
                    )}

                    {/* Cancellation Reason */}
                    {booking.cancellationReason && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                        <span className="font-bold">Cancellation Reason:</span>
                        <p>{booking.cancellationReason}</p>
                      </div>
                    )}

                    {/* Meeting Link Email Notice */}
                    {booking.status === 'CONFIRMED' && (
                      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                              Session Meeting Link
                            </span>
                            <p className="text-xs font-semibold text-slate-800">
                              The meeting link will be sent to your email by {booking.mentor.name}.
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Your mentor will send the meeting / session link directly to your registered email before the scheduled session starts.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions Bar: Reschedule & Cancel */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-3">
                      <div className="text-xs text-slate-400">
                        Booked on{' '}
                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {booking.canReschedule && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRescheduleModal(true)}
                            className="flex-1 sm:flex-none border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold text-xs py-2 px-4"
                          >
                            Reschedule
                          </Button>
                        )}

                        {booking.canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCancelModal(true)}
                            className="flex-1 sm:flex-none border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs py-2 px-4"
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <p className="text-sm text-slate-600">Booking details could not be found.</p>
              <Link href="/mentors/bookings">
                <Button variant="outline" size="sm">
                  View All Bookings
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Cancellation Modal */}
      {showCancelModal && booking && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => !isCancelling && setShowCancelModal(false)}
          title="Cancel Mentorship Booking"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your session with{' '}
              <strong className="text-slate-900">{booking.mentor.name}</strong> scheduled for{' '}
              <strong className="text-slate-900">
                {new Date(booking.scheduledStart).toLocaleDateString()}
              </strong>
              ?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let your mentor know why you need to cancel..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {cancelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && booking && (
        <Modal
          isOpen={showRescheduleModal}
          onClose={() => !isRescheduling && setShowRescheduleModal(false)}
          title="Reschedule Mentorship Booking"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Choose a replacement time for your session with{' '}
              <strong className="text-slate-900">{booking.mentor.name}</strong>.
            </p>

            {/* Date Navigator */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Date:</label>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                <button
                  type="button"
                  onClick={() => changeDateBy(-1)}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => changeDateBy(1)}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slots Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Available Slots:</label>
              {slotsLoading ? (
                <div className="py-6 text-center text-xs text-slate-500">Loading available slots...</div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  No slots available on this date. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.start === slot.start;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        {formatSlotDisplay(slot.displayTime)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Note for mentor (optional):
              </label>
              <textarea
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                placeholder="Reason for rescheduling or topic update..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {rescheduleError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRescheduleModal(false)}
                disabled={isRescheduling}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmReschedule}
                disabled={!selectedSlot}
                isLoading={isRescheduling}
              >
                Request Reschedule
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function CandidateBookingDetailPage({ params }: { params?: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <CandidateBookingDetailContent params={params} />
    </Suspense>
  );
}
