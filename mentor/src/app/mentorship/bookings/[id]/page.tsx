'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MentorShell } from '@/components/MentorShell';
import { StatusBadge } from '@/components/StatusBadge';
import { CardSkeleton } from '@/components/Skeleton';
import { BookingDetailDTO } from '@backend/types/mentorship';
import {
  Calendar,
  Clock,
  Mail,
  User,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

function BookingDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSource = searchParams?.get('from');

  const backHref = fromSource === 'dashboard' ? '/dashboard' : '/mentorship/bookings';
  const backLabel = fromSource === 'dashboard' ? 'Back to Dashboard' : 'Back to Bookings';

  const [booking, setBooking] = useState<BookingDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBooking = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/bookings/${params.id}`);
      if (!res.ok) throw new Error('Failed to retrieve booking');
      const data = await res.json();
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message || 'Error fetching booking details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const handleUpdateStatus = async (
    statusOrOptions?: string | { status?: string; action?: string; reason?: string },
    actionOrReason?: string,
    maybeReason?: string
  ) => {
    setIsUpdating(true);
    setError(null);
    try {
      let status: string | undefined;
      let action: string | undefined;
      let reason: string | undefined;

      const validActions = [
        'APPROVE_RESCHEDULE',
        'REJECT_RESCHEDULE',
        'CONFIRM',
        'CANCEL',
        'COMPLETE',
      ];

      if (typeof statusOrOptions === 'object' && statusOrOptions !== null) {
        status = statusOrOptions.status;
        action = statusOrOptions.action;
        reason = statusOrOptions.reason;
      } else {
        status = statusOrOptions;
        if (actionOrReason && validActions.includes(actionOrReason)) {
          action = actionOrReason;
          reason = maybeReason;
        } else {
          // If 2nd parameter is not a valid enum action, treat it as reason
          reason = actionOrReason;
        }
      }

      // Default corresponding action if not explicitly supplied
      if (!action) {
        if (status === 'CANCELLED_BY_MENTOR') action = 'CANCEL';
        else if (status === 'COMPLETED') action = 'COMPLETE';
        else if (status === 'CONFIRMED') action = 'CONFIRM';
      }

      const payload: any = {};
      if (status) payload.status = status;
      if (action) payload.action = action;
      if (reason) payload.reason = reason;

      const res = await fetch(`/api/mentor/bookings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        let errMsg = json.error || 'Failed to update booking status';
        try {
          const parsed = JSON.parse(errMsg);
          if (Array.isArray(parsed) && parsed[0]?.message) {
            errMsg = parsed.map((p: any) => p.message).join(', ');
          }
        } catch {}
        throw new Error(errMsg);
      }

      setActionSuccess(
        action === 'REJECT_RESCHEDULE'
          ? 'Reschedule request declined. Original booking schedule preserved.'
          : action === 'APPROVE_RESCHEDULE'
          ? 'Rescheduled time confirmed successfully.'
          : `Booking status transitioned to ${status || action}`
      );
      setShowCancelModal(false);
      setCancelReason('');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchBooking();
    } catch (err: any) {
      setError(err.message || 'Status update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <MentorShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-semibold"
            title={backLabel}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Booking Reservation
            </h1>
            <p className="text-xs text-slate-500">ID: {params.id}</p>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <CardSkeleton />
        ) : booking ? (
          <div className="space-y-6">
            {/* Header card with status and actions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {booking.service.title}
                  </h2>
                  <StatusBadge status={booking.status} size="md" />
                </div>
                <p className="text-xs text-slate-500">
                  {booking.service.duration} mins • {booking.service.price === 0 ? 'Free Pro-Bono' : `₹${booking.service.price}`} • {booking.service.category.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {booking.status === 'CONFIRMED' && (() => {
                  const sessionStart = new Date(booking.scheduledStart);
                  const formattedDate = sessionStart.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: booking.timezone || 'Asia/Kolkata',
                  });
                  const formattedTime = sessionStart.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: booking.timezone || 'Asia/Kolkata',
                  });
                  const meetingLink = booking.session?.meetingUrl || 'https://meet.google.com/new';
                  const emailSubject = `Mentorship Session Joining Link — ${booking.service.title}`;
                  const emailBody = `Hi ${booking.candidate.name},\n\nHere is your joining link for our upcoming mentorship session on PATHWAY.ECO:\n\n• Session: ${booking.service.title}\n• Scheduled Date & Time: ${formattedDate} at ${formattedTime} (${booking.timezone})\n• Meeting Link: ${meetingLink}\n\nPlease join a few minutes prior to the start time. Looking forward to speaking with you!\n\nBest regards,\nYour Mentor`;

                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.candidate.email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                  return (
                    <a
                      href={gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition active:scale-[0.98]"
                      title="Send joining link to student via Gmail Web (opens in new tab)"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Joining Link</span>
                    </a>
                  );
                })()}

                {booking.status === 'PENDING' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('CONFIRMED', 'CONFIRM')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                  >
                    Accept & Confirm
                  </button>
                )}

                {booking.status === 'RESCHEDULE_REQUESTED' && (
                  <>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('CONFIRMED', 'APPROVE_RESCHEDULE')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                    >
                      Accept Reschedule
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus('CONFIRMED', 'REJECT_RESCHEDULE')}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition shadow-sm"
                    >
                      Decline Request
                    </button>
                  </>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Mark Completed
                  </button>
                )}

                {!['COMPLETED', 'CANCELLED_BY_MENTOR', 'CANCELLED_BY_CANDIDATE'].includes(booking.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Context Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Student Details
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center border border-blue-200">
                    {booking.candidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {booking.candidate.name}
                    </h4>
                    <p className="text-xs text-slate-500">{booking.candidate.email}</p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {booking.candidate.headline || booking.candidate.candidateType || 'Candidate'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/students/${booking.candidate.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    View Mentorship History & Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Timing & Scheduling Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Scheduled Time
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(booking.scheduledStart).toLocaleDateString([], {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Session Window:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      -{' '}
                      {new Date(booking.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Designated Timezone:</span>
                    <span className="font-semibold text-slate-800">{booking.timezone}</span>
                  </div>

                  {booking.status === 'RESCHEDULE_REQUESTED' && booking.rescheduledStart && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Requested Replacement Time:</span>
                      </div>
                      <p className="text-slate-800 font-semibold">
                        {new Date(booking.rescheduledStart).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(booking.rescheduledStart).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {booking.rescheduledEnd
                          ? new Date(booking.rescheduledEnd).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Declining this request keeps your currently confirmed session above.
                      </p>
                    </div>
                  )}
                </div>

                {booking.cancellationReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mt-2">
                    <span className="font-semibold block">Cancellation Reason:</span>
                    {booking.cancellationReason}
                  </div>
                )}
              </div>
            </div>

            {/* Candidate booking notes / goal */}
            {booking.studentNotes && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Student Session Goal & Context
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  &ldquo;{booking.studentNotes}&rdquo;
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Cancel Mentorship Booking</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please state a reason for the candidate explaining why this session must be cancelled.
            </p>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Unforeseen scheduling conflict, please rebook for later this week..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl mb-4 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Keep Booking
              </button>
              <button
                disabled={isUpdating || !cancelReason.trim()}
                onClick={() =>
                  handleUpdateStatus({
                    status: 'CANCELLED_BY_MENTOR',
                    action: 'CANCEL',
                    reason: cancelReason,
                  })
                }
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </MentorShell>
  );
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <BookingDetailContent params={params} />
    </Suspense>
  );
}
