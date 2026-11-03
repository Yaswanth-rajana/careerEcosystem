'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertCircle,
  CalendarX,
  RotateCw,
  Globe,
} from 'lucide-react';
import { Mentor, MentorSessionOption, AvailableSlot } from '@/lib/mentors/mentor-types';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';

interface BookingModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  preSelectedOptionId?: string;
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

function formatDateFull(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  return dateObj.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  isOpen,
  onClose,
  preSelectedOptionId,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(preSelectedOptionId || '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [mentorTimezone, setMentorTimezone] = useState<string>('Asia/Kolkata');

  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Compute available dates (next 14 days starting from today in local time)
  const quickDates = useMemo(() => {
    const dates: Array<{
      dateStr: string;
      label: string;
      dayOfWeek: string;
      dayNum: string;
      monthStr: string;
    }> = [];

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

      let label = `${dayOfWeek}, ${monthStr} ${dayNum}`;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';

      dates.push({
        dateStr,
        label,
        dayOfWeek,
        dayNum,
        monthStr,
      });
    }
    return dates;
  }, []);

  const sessionOptions = useMemo(() => {
    if (!mentor) return [];
    if (mentor.sessionOptions && mentor.sessionOptions.length > 0) {
      return mentor.sessionOptions;
    }
    return [
      {
        id: mentor.matchingService?.id || 'default-1',
        title: mentor.matchingService?.title || '1-on-1 Career Guidance Session',
        durationMin: mentor.matchingService?.duration || 45,
        price: mentor.matchingService?.price ?? mentor.startingPrice,
        description: mentor.matchingService?.description || 'Personalized advice on your career goals, portfolio, or technical strategy.',
        type: (mentor.sessionTypes[0] || 'Career Guidance') as any,
      },
    ];
  }, [mentor]);

  const selectedOption = useMemo(() => {
    return sessionOptions.find((o) => o.id === selectedOptionId) || sessionOptions[0];
  }, [sessionOptions, selectedOptionId]);

  // Reset modal state on open or mentor change
  useEffect(() => {
    if (isOpen) {
      if (preSelectedOptionId) {
        setSelectedOptionId(preSelectedOptionId);
      } else if (mentor?.matchingService?.id) {
        setSelectedOptionId(mentor.matchingService.id);
      } else if (mentor?.sessionOptions && mentor.sessionOptions.length > 0) {
        setSelectedOptionId(mentor.sessionOptions[0].id);
      }

      if (quickDates.length > 0 && !selectedDate) {
        setSelectedDate(quickDates[0].dateStr);
      }

      setStep(1);
      setSelectedSlot(null);
      setBookingError(null);
      setConfirmedBooking(null);
    }
  }, [isOpen, mentor, preSelectedOptionId, quickDates, selectedDate]);

  // Fetch available slots from backend candidate discovery endpoint
  const fetchSlots = useCallback(
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
          setMentorTimezone(data.timezone);
        }
      } catch (err: any) {
        setSlotsError(err.message || 'Unable to retrieve available times. Please try again.');
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    },
    []
  );

  // Trigger slot fetch whenever mentor, selected option, or date changes
  useEffect(() => {
    if (isOpen && mentor?.id && selectedOption?.id && selectedDate) {
      fetchSlots(mentor.id, selectedOption.id, selectedDate);
    }
  }, [isOpen, mentor?.id, selectedOption?.id, selectedDate, fetchSlots]);

  if (!mentor) return null;

  const handleClose = () => {
    setStep(1);
    setNote('');
    setSelectedSlot(null);
    setBookingError(null);
    setConfirmedBooking(null);
    onClose();
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlot(null);
    setBookingError(null);
  };

  const handleOptionChange = (newOptionId: string) => {
    setSelectedOptionId(newOptionId);
    setSelectedSlot(null);
    setBookingError(null);
  };

  const handleSubmitBooking = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/mentors/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          serviceId: selectedOption.id,
          scheduledStart: selectedSlot.start, // UTC timestamp
          timezone: mentorTimezone,
          studentNotes: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setConfirmedBooking(data.booking);
      setStep(3);
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while confirming your session.';
      setBookingError(errorMsg);

      // If the slot became unavailable, refresh availability and stay responsive
      if (
        errorMsg.includes('just reserved') ||
        errorMsg.includes('unavailable') ||
        errorMsg.includes('falls outside') ||
        errorMsg.includes('conflict')
      ) {
        fetchSlots(mentor.id, selectedOption.id, selectedDate);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 3 ? 'Booking Confirmed' : `Book Session with ${mentor.name}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-left">
        {/* Mentor Mini Header */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-300 shrink-0">
            <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" sizes="48px" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 font-display text-sm">
                {mentor.name}
              </h4>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500">{mentor.role} · {mentor.domain}</p>
          </div>
        </div>

        {/* STEP 1: Select Session Option, Date & Real Slot */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Service Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                1. Select Mentorship Service
              </label>
              <div className="space-y-2">
                {sessionOptions.map((opt) => {
                  const isSelected = selectedOption.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionChange(opt.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-xs">
                              {opt.title}
                            </h5>
                            {mentor.matchingService?.id === opt.id && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                                Matched
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {opt.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-slate-900">
                            {opt.price === 0 ? 'FREE' : `₹${opt.price.toLocaleString()}`}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {opt.durationMin} mins
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                  2. Select Date
                </label>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  {mentorTimezone}
                </span>
              </div>

              {/* Horizontal Scrollable Date Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {quickDates.map((item) => {
                  const isDateSelected = selectedDate === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => handleDateChange(item.dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-2.5 rounded-xl border text-xs transition-all shrink-0 ${
                        isDateSelected
                          ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-semibold ${isDateSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.dayOfWeek}
                      </span>
                      <span className="text-sm font-extrabold my-0.5">
                        {item.dayNum}
                      </span>
                      <span className={`text-[10px] ${isDateSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.monthStr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Discovery Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                  3. Available Time Slots
                </label>
                {selectedDate && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatDateFull(selectedDate)}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {isLoadingSlots && (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    Checking {mentor.name}&apos;s real-time availability...
                  </p>
                </div>
              )}

              {/* Error State */}
              {!isLoadingSlots && slotsError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{slotsError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchSlots(mentor.id, selectedOption.id, selectedDate)}
                    className="font-bold underline text-[11px] hover:text-rose-800 flex items-center gap-1 shrink-0 ml-2"
                  >
                    <RotateCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingSlots && !slotsError && availableSlots.length === 0 && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <CalendarX className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">No open slots on this date</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {mentor.name} has no available working hours or all slots are booked for this date. Please select another date above.
                  </p>
                </div>
              )}

              {/* Real Slots Grid */}
              {!isLoadingSlots && !slotsError && availableSlots.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={slot.start}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold ring-1 ring-blue-600 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="truncate">{formatSlotDisplay(slot.displayTime)}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Includes 15-min buffer between sessions for mentor transition &amp; rest
                    </span>
                    <span className="text-[10px] text-slate-400">
                      All times displayed in mentor&apos;s local timezone ({mentorTimezone})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1 Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Step 1 of 2</span>
              <Button
                variant="primary"
                size="md"
                disabled={!selectedSlot || isLoadingSlots}
                onClick={() => setStep(2)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Notes & Review Request */}
        {step === 2 && (
          <div className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{bookingError}</span>
                </div>
                <div className="pl-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep(1);
                      if (selectedDate) fetchSlots(mentor.id, selectedOption.id, selectedDate);
                    }}
                    className="text-[11px] font-bold text-rose-800 underline hover:bg-rose-100 p-0 h-auto"
                  >
                    Select an alternative slot &rarr;
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                What topic or code blocker would you like to focus on? (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Preparing for a system design round on microservices, or reviewing my senior engineer resume..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Request Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Selected Service:</span>
                <span className="font-bold text-slate-900">{selectedOption.title}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Duration:</span>
                <span className="font-semibold text-slate-900">{selectedOption.durationMin} mins</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Scheduled Date:</span>
                <span className="font-semibold text-slate-900">{formatDateFull(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Selected Slot:</span>
                <span className="font-bold text-emerald-600">
                  {selectedSlot ? formatSlotDisplay(selectedSlot.displayTime) : ''} ({mentorTimezone})
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Total:</span>
                <span className="text-blue-600">
                  {selectedOption.price === 0 ? 'FREE' : `₹${selectedOption.price.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="text-xs"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitBooking}
                disabled={isSubmitting || !selectedSlot}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Session Booking'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmed Status */}
        {step === 3 && (
          <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-display text-slate-900">
                Mentorship Session Confirmed!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your session has been successfully booked with {mentor.name}. An email invitation and calendar hold have been scheduled.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <p className="font-bold text-slate-900 pb-1 border-b border-slate-200">Booking Summary</p>
              <p className="text-slate-600"><span className="font-medium text-slate-800">Mentor:</span> {mentor.name}</p>
              <p className="text-slate-600"><span className="font-medium text-slate-800">Service:</span> {selectedOption.title}</p>
              <p className="text-slate-600"><span className="font-medium text-slate-800">Date:</span> {formatDateFull(selectedDate)}</p>
              <p className="text-slate-600">
                <span className="font-medium text-slate-800">Time:</span>{' '}
                <span className="font-bold text-emerald-600">
                  {selectedSlot ? formatSlotDisplay(selectedSlot.displayTime) : ''} ({mentorTimezone})
                </span>
              </p>
              <p className="text-slate-600"><span className="font-medium text-slate-800">Duration:</span> {selectedOption.durationMin} minutes</p>
              {confirmedBooking?.session?.meetingUrl && (
                <p className="text-slate-600 pt-1 border-t border-slate-200 truncate">
                  <span className="font-medium text-slate-800">Meeting Room:</span>{' '}
                  <span className="text-blue-600 font-mono text-[11px]">{confirmedBooking.session.meetingUrl}</span>
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button
                variant="primary"
                size="md"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                onClick={handleClose}
              >
                Done & Return to Mentors
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
