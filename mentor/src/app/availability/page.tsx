'use client';

import React, { useState, useEffect } from 'react';
import { MentorShell } from '@/components/MentorShell';
import { AvailabilityRuleDTO, AvailabilityExceptionDTO, AvailableSlotDTO } from '@backend/types/mentorship';
import { Clock, Plus, Trash2, Globe, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { CardSkeleton } from '@/components/Skeleton';

const DAYS_OF_WEEK = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' },
];

export default function AvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRuleDTO[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityExceptionDTO[]>([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Exception modal/form state
  const [excDate, setExcDate] = useState('');
  const [excType, setExcType] = useState<'UNAVAILABLE' | 'CUSTOM_HOURS'>('UNAVAILABLE');
  const [excStartTime, setExcStartTime] = useState('10:00');
  const [excEndTime, setExcEndTime] = useState('14:00');
  const [excReason, setExcReason] = useState('');
  const [showExcForm, setShowExcForm] = useState(false);

  // Slot generator preview state
  const [previewStartDate, setPreviewStartDate] = useState('');
  const [previewEndDate, setPreviewEndDate] = useState('');
  const [previewDuration, setPreviewDuration] = useState(45);
  const [calculatedSlots, setCalculatedSlots] = useState<AvailableSlotDTO[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor/availability');
      if (!res.ok) throw new Error('Failed to load availability');
      const data = await res.json();

      setTimezone(data.summary?.timezone || 'Asia/Kolkata');

      // Ensure all 7 days exist in local state
      const existingRules = data.rules || [];
      const completeRules: AvailabilityRuleDTO[] = DAYS_OF_WEEK.map((d) => {
        const found = existingRules.find((r: any) => r.dayOfWeek === d.index);
        return (
          found || {
            id: `temp-${d.index}`,
            mentorId: '',
            dayOfWeek: d.index,
            dayName: d.name,
            startTime: '09:00',
            endTime: '17:00',
            timezone: data.summary?.timezone || 'Asia/Kolkata',
            active: d.index >= 1 && d.index <= 5, // active Mon-Fri by default
          }
        );
      });

      setRules(completeRules);
      setExceptions(data.exceptions || []);

      // Default preview dates to next 7 days
      const today = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setPreviewStartDate(today.toISOString().split('T')[0]);
      setPreviewEndDate(nextWeek.toISOString().split('T')[0]);
    } catch (err: any) {
      setError(err.message || 'Error fetching availability');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleRuleChange = (dayIndex: number, field: keyof AvailabilityRuleDTO, value: any) => {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayIndex ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveWeeklySchedule = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        timezone,
        rules: rules.map((r) => ({
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
          timezone,
          active: r.active,
        })),
      };

      const res = await fetch('/api/mentor/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update schedule');
      }

      setSuccessMsg('Weekly availability schedule saved successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excDate) return;

    try {
      const payload: any = {
        date: excDate,
        type: excType,
        reason: excReason || undefined,
      };

      if (excType === 'CUSTOM_HOURS') {
        payload.startTime = excStartTime;
        payload.endTime = excEndTime;
      }

      const res = await fetch('/api/mentor/availability/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to add exception');
      }

      setSuccessMsg('Availability exception saved');
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowExcForm(false);
      setExcDate('');
      setExcReason('');
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'Error saving exception');
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      const res = await fetch(`/api/mentor/availability/exceptions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete exception');
      setSuccessMsg('Exception removed');
      setTimeout(() => setSuccessMsg(null), 2500);
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || 'Error removing exception');
    }
  };

  const handleCalculateSlots = async () => {
    if (!previewStartDate || !previewEndDate) return;
    setIsCalculating(true);
    try {
      const res = await fetch(
        `/api/mentor/availability/slots?startDate=${previewStartDate}&endDate=${previewEndDate}&duration=${previewDuration}`
      );
      if (!res.ok) throw new Error('Failed to calculate slots');
      const data = await res.json();
      setCalculatedSlots(data.slots || []);
    } catch (err: any) {
      setError(err.message || 'Slot calculation error');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <MentorShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Mentorship Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure your recurring weekly schedule, timezones, and blackout dates
            </p>
          </div>

          <button
            onClick={handleSaveWeeklySchedule}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isSaving ? 'Saving Schedule...' : 'Save Weekly Schedule'}
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly recurring rules (2 columns) */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Weekly Schedule
                    </h3>
                  </div>

                  {/* Timezone picker */}
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="America/New_York">America/New_York (EST -5:00)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST -8:00)</option>
                      <option value="Europe/London">Europe/London (GMT +0:00)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                      <option value="UTC">UTC (+0:00)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const rule = rules.find((r) => r.dayOfWeek === day.index);
                    if (!rule) return null;

                    return (
                      <div
                        key={day.index}
                        className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          rule.active
                            ? 'bg-white border-slate-200/80'
                            : 'bg-slate-50/60 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 w-36">
                          <input
                            type="checkbox"
                            id={`day-${day.index}`}
                            checked={rule.active}
                            onChange={(e) =>
                              handleRuleChange(day.index, 'active', e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`day-${day.index}`}
                            className="text-xs font-bold text-slate-900 cursor-pointer"
                          >
                            {day.name}
                          </label>
                        </div>

                        {rule.active ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={rule.startTime}
                              onChange={(e) =>
                                handleRuleChange(day.index, 'startTime', e.target.value)
                              }
                              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800"
                            />
                            <span className="text-xs text-slate-400">to</span>
                            <input
                              type="time"
                              value={rule.endTime}
                              onChange={(e) =>
                                handleRuleChange(day.index, 'endTime', e.target.value)
                              }
                              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unavailable</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slot Generation Simulator (Requirement 10 & 31) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Availability Engine Simulator
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Conflict-Free Engine
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Verify how your active rules, exceptions, and existing candidate bookings calculate real-time bookable slots on the server.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={previewStartDate}
                      onChange={(e) => setPreviewStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={previewEndDate}
                      onChange={(e) => setPreviewEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Service Duration
                    </label>
                    <select
                      value={previewDuration}
                      onChange={(e) => setPreviewDuration(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateSlots}
                  disabled={isCalculating}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  {isCalculating ? 'Computing slots...' : 'Compute Available Slots'}
                </button>

                {calculatedSlots !== null && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Computed Available Slots: {calculatedSlots.length}
                      </span>
                    </div>

                    {calculatedSlots.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No available slots found in this range. Either dates are past, rules are inactive, or slots are reserved.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {calculatedSlots.slice(0, 24).map((slot, i) => (
                          <div
                            key={i}
                            className="p-2 bg-blue-50/60 border border-blue-100 rounded-lg text-center"
                          >
                            <span className="block text-[11px] font-bold text-blue-900">
                              {slot.date}
                            </span>
                            <span className="text-[10px] text-blue-700">
                              {slot.displayTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Exceptions & Blackout dates (1 column) */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Exceptions & Blackouts
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowExcForm(!showExcForm)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Add date exception"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Mark holidays, vacations, or custom one-off availability overrides without modifying your recurring schedule.
                </p>

                {showExcForm && (
                  <form
                    onSubmit={handleAddException}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        Override Date
                      </label>
                      <input
                        type="date"
                        required
                        value={excDate}
                        onChange={(e) => setExcDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        Override Type
                      </label>
                      <select
                        value={excType}
                        onChange={(e) => setExcType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="UNAVAILABLE">Unavailable (Full Day Off)</option>
                        <option value="CUSTOM_HOURS">Custom Working Hours</option>
                      </select>
                    </div>

                    {excType === 'CUSTOM_HOURS' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase">
                            Start
                          </label>
                          <input
                            type="time"
                            value={excStartTime}
                            onChange={(e) => setExcStartTime(e.target.value)}
                            className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase">
                            End
                          </label>
                          <input
                            type="time"
                            value={excEndTime}
                            onChange={(e) => setExcEndTime(e.target.value)}
                            className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                        Reason (Optional)
                      </label>
                      <input
                        type="text"
                        value={excReason}
                        onChange={(e) => setExcReason(e.target.value)}
                        placeholder="e.g. Conference, Medical leave"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowExcForm(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                {exceptions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    No exceptions scheduled.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exceptions.map((exc) => (
                      <div
                        key={exc.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{exc.date}</div>
                          <div className="text-[11px] text-slate-500">
                            {exc.type === 'UNAVAILABLE'
                              ? 'Fully Unavailable'
                              : `Custom: ${exc.startTime} - ${exc.endTime}`}
                            {exc.reason && ` • ${exc.reason}`}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteException(exc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Remove exception"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MentorShell>
  );
}
