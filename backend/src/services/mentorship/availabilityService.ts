import { db } from '../../db/client';
import {
  AvailabilityRuleDTO,
  AvailabilityExceptionDTO,
  AvailableSlotDTO,
  CandidateAvailableSlotsResponseDTO,
} from '../../types/mentorship';
import {
  AvailabilityRuleInputSchema,
  SetWeeklyAvailabilitySchema,
  AvailabilityExceptionSchema,
} from '../../validations/mentorshipSchemas';
import { z } from 'zod';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

/**
 * Converts a local calendar date/time in an IANA timezone into an exact UTC instant.
 * Handles DST forward transitions (gaps) and backward transitions (ambiguity) deterministically.
 */
export function localToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const desiredLocalUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const guess = new Date(desiredLocalUtc);

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  function getLocalTimeAt(d: Date): number {
    const parts = dtf.formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) {
      p[part.type] = part.value;
    }
    let h = parseInt(p.hour, 10);
    if (h === 24) h = 0;
    return Date.UTC(
      parseInt(p.year, 10),
      parseInt(p.month, 10) - 1,
      parseInt(p.day, 10),
      h,
      parseInt(p.minute, 10),
      parseInt(p.second || '0', 10)
    );
  }

  // 1st iteration
  const localAtGuess = getLocalTimeAt(guess);
  const offset1 = localAtGuess - guess.getTime();
  const candidate1 = new Date(desiredLocalUtc - offset1);

  // 2nd iteration to handle DST transition boundary
  const localAtCandidate1 = getLocalTimeAt(candidate1);
  const offset2 = localAtCandidate1 - candidate1.getTime();
  const candidate2 = new Date(desiredLocalUtc - offset2);

  // Check exact matches
  const localAtCandidate2 = getLocalTimeAt(candidate2);
  if (localAtCandidate2 === desiredLocalUtc) {
    return candidate2;
  }
  if (localAtCandidate1 === desiredLocalUtc) {
    return candidate1;
  }

  // Nonexistent local time during DST spring-forward gap:
  // Deterministically resolve to the post-transition instant (candidate1)
  return candidate1;
}

/**
 * Converts a UTC Date instant to local date/time parts in the given IANA timezone.
 */
export function utcToLocalParts(date: Date, timeZone: string): LocalDateTimeParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const p: Record<string, string> = {};
  for (const part of parts) {
    p[part.type] = part.value;
  }

  let h = parseInt(p.hour, 10);
  if (h === 24) h = 0;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayOfWeek = weekdayMap[p.weekday] ?? 0;
  const year = parseInt(p.year, 10);
  const month = parseInt(p.month, 10);
  const day = parseInt(p.day, 10);
  const minute = parseInt(p.minute, 10);
  const second = parseInt(p.second || '0', 10);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    hour: h,
    minute,
    second,
    dateStr,
    timeStr,
    dayOfWeek,
  };
}

export const DEFAULT_MENTOR_BUFFER_MINUTES = 15;

export class AvailabilityService {
  static readonly DEFAULT_BUFFER_MINUTES = DEFAULT_MENTOR_BUFFER_MINUTES;
  static localToUtc = localToUtc;
  static utcToLocalParts = utcToLocalParts;
  /**
   * Retrieves weekly rules for a mentor.
   */
  static async getWeeklyRules(mentorId: string): Promise<AvailabilityRuleDTO[]> {
    const rules = await db.availabilityRule.findMany({
      where: { mentorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return rules.map((r) => ({
      id: r.id,
      mentorId: r.mentorId,
      dayOfWeek: r.dayOfWeek,
      dayName: DAY_NAMES[r.dayOfWeek] || `Day ${r.dayOfWeek}`,
      startTime: r.startTime,
      endTime: r.endTime,
      timezone: r.timezone,
      active: r.active,
    }));
  }

  /**
   * Sets weekly availability rules for a mentor in a single atomic transaction.
   */
  static async setWeeklyRules(
    mentorId: string,
    data: z.infer<typeof SetWeeklyAvailabilitySchema>
  ): Promise<AvailabilityRuleDTO[]> {
    const validated = SetWeeklyAvailabilitySchema.parse(data);

    // Delete existing rules and insert new rules in a transaction
    await db.$transaction([
      db.availabilityRule.deleteMany({ where: { mentorId } }),
      db.availabilityRule.createMany({
        data: validated.rules.map((rule) => ({
          mentorId,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          timezone: validated.timezone || rule.timezone || 'Asia/Kolkata',
          active: rule.active !== undefined ? rule.active : true,
        })),
      }),
    ]);

    return this.getWeeklyRules(mentorId);
  }

  /**
   * Retrieves all date-specific exceptions for a mentor.
   */
  static async getExceptions(mentorId: string, fromDate?: string): Promise<AvailabilityExceptionDTO[]> {
    const where: any = { mentorId };
    if (fromDate) {
      where.date = { gte: fromDate };
    }

    const exceptions = await db.availabilityException.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return exceptions.map((e) => ({
      id: e.id,
      mentorId: e.mentorId,
      date: e.date,
      type: e.type as 'UNAVAILABLE' | 'CUSTOM_HOURS',
      startTime: e.startTime,
      endTime: e.endTime,
      reason: e.reason,
    }));
  }

  /**
   * Adds an availability exception (e.g. sick day, vacation, or custom hours).
   */
  static async addException(
    mentorId: string,
    data: z.infer<typeof AvailabilityExceptionSchema>
  ): Promise<AvailabilityExceptionDTO> {
    const validated = AvailabilityExceptionSchema.parse(data);

    // Upsert exception for this mentor and date
    const existing = await db.availabilityException.findFirst({
      where: { mentorId, date: validated.date },
    });

    let exception;
    if (existing) {
      exception = await db.availabilityException.update({
        where: { id: existing.id },
        data: {
          type: validated.type,
          startTime: validated.startTime || null,
          endTime: validated.endTime || null,
          reason: validated.reason || null,
        },
      });
    } else {
      exception = await db.availabilityException.create({
        data: {
          mentorId,
          date: validated.date,
          type: validated.type,
          startTime: validated.startTime || null,
          endTime: validated.endTime || null,
          reason: validated.reason || null,
        },
      });
    }

    return {
      id: exception.id,
      mentorId: exception.mentorId,
      date: exception.date,
      type: exception.type as 'UNAVAILABLE' | 'CUSTOM_HOURS',
      startTime: exception.startTime,
      endTime: exception.endTime,
      reason: exception.reason,
    };
  }

  /**
   * Removes an availability exception.
   */
  static async deleteException(exceptionId: string, mentorId: string): Promise<void> {
    const existing = await db.availabilityException.findUnique({
      where: { id: exceptionId },
    });

    if (!existing || existing.mentorId !== mentorId) {
      throw new Error('Exception not found or unauthorized');
    }

    await db.availabilityException.delete({ where: { id: exceptionId } });
  }

  /**
   * Calculates available slots within a bounded date range.
   * Requirement 10 & 31: Availability rule + Exception + Bookings + Service duration.
   * Server is source of truth. Bounded to max 31 days.
   * Interprets availability rules in mentor's configured IANA timezone and generates accurate UTC instants.
   * Supports configurable buffer / slack interval between meetings to relax or switch meets (default: 0 if unbuffered, 15 in candidate discovery).
   */
  static async getAvailableSlots(params: {
    mentorId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    durationMinutes: number; // e.g. 30, 45, 60
    timezone?: string;
    bufferMinutes?: number; // Relaxation/transition slack between meetings (in minutes)
  }): Promise<AvailableSlotDTO[]> {
    const { mentorId, startDate, endDate, durationMinutes } = params;
    const bufferMinutes = params.bufferMinutes !== undefined ? Math.max(0, params.bufferMinutes) : 0;
    const bufferMs = bufferMinutes * 60 * 1000;

    // Safety: Validate YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error('startDate and endDate must be in YYYY-MM-DD format');
    }

    const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
    const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
    const calStart = new Date(Date.UTC(sYear, sMonth - 1, sDay));
    const calEnd = new Date(Date.UTC(eYear, eMonth - 1, eDay));

    if (calEnd.getTime() < calStart.getTime()) {
      return [];
    }

    const diffDays = Math.round((calEnd.getTime() - calStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 31) {
      throw new Error('Requested availability window cannot exceed 31 days');
    }

    // Fetch active rules to resolve mentor timezone
    const rules = await db.availabilityRule.findMany({
      where: { mentorId, active: true },
    });

    const mentorTimezone = params.timezone || rules[0]?.timezone || 'Asia/Kolkata';

    // Calculate search bounds in UTC covering the full local date range [startDate 00:00, endDate 23:59:59]
    const searchRangeStartUtc = localToUtc(sYear, sMonth, sDay, 0, 0, mentorTimezone);
    const searchRangeEndUtc = new Date(localToUtc(eYear, eMonth, eDay, 23, 59, mentorTimezone).getTime() + 60 * 1000);

    // Fetch exceptions in range and existing bookings within the search window
    const [exceptions, existingBookings] = await Promise.all([
      db.availabilityException.findMany({
        where: {
          mentorId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      db.booking.findMany({
        where: {
          mentorId,
          status: { in: ['CONFIRMED', 'PENDING', 'RESCHEDULE_REQUESTED'] },
          OR: [
            {
              scheduledStart: { lt: searchRangeEndUtc },
              scheduledEnd: { gt: searchRangeStartUtc },
            },
            {
              status: 'RESCHEDULE_REQUESTED',
              rescheduledStart: { not: null, lt: searchRangeEndUtc },
              rescheduledEnd: { not: null, gt: searchRangeStartUtc },
            },
          ],
        },
        select: {
          scheduledStart: true,
          scheduledEnd: true,
          rescheduledStart: true,
          rescheduledEnd: true,
          status: true,
        },
      }),
    ]);

    const exceptionMap = new Map<string, typeof exceptions[0]>();
    for (const exc of exceptions) {
      exceptionMap.set(exc.date, exc);
    }

    const ruleMap = new Map<number, typeof rules[0]>();
    for (const rule of rules) {
      ruleMap.set(rule.dayOfWeek, rule);
    }

    const availableSlots: AvailableSlotDTO[] = [];
    const now = new Date();

    // Iterate through each calendar day in the mentor's timezone
    let curCal = new Date(calStart);
    while (curCal.getTime() <= calEnd.getTime()) {
      const year = curCal.getUTCFullYear();
      const month = curCal.getUTCMonth() + 1;
      const day = curCal.getUTCDate();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = curCal.getUTCDay();

      const dayException = exceptionMap.get(dateStr);
      let dayStartHour: number | null = null;
      let dayStartMin: number = 0;
      let dayEndHour: number | null = null;
      let dayEndMin: number = 0;

      if (dayException) {
        if (dayException.type === 'UNAVAILABLE') {
          // Entire day blocked
          curCal.setUTCDate(curCal.getUTCDate() + 1);
          continue;
        } else if (dayException.type === 'CUSTOM_HOURS' && dayException.startTime && dayException.endTime) {
          const [sh, sm] = dayException.startTime.split(':').map(Number);
          const [eh, em] = dayException.endTime.split(':').map(Number);
          dayStartHour = sh;
          dayStartMin = sm;
          dayEndHour = eh;
          dayEndMin = em;
        }
      } else {
        const rule = ruleMap.get(dayOfWeek);
        if (rule) {
          const [sh, sm] = rule.startTime.split(':').map(Number);
          const [eh, em] = rule.endTime.split(':').map(Number);
          dayStartHour = sh;
          dayStartMin = sm;
          dayEndHour = eh;
          dayEndMin = em;
        }
      }

      if (dayStartHour !== null && dayEndHour !== null) {
        // Correct timezone conversion: build exact UTC window for local hours
        const windowStartUtc = localToUtc(year, month, day, dayStartHour, dayStartMin, mentorTimezone);
        const windowEndUtc = localToUtc(year, month, day, dayEndHour, dayEndMin, mentorTimezone);

        let slotStart = new Date(windowStartUtc);
        while (slotStart.getTime() + durationMinutes * 60 * 1000 <= windowEndUtc.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

          // Discard past slots (allow 10-minute buffer from now)
          if (slotStart.getTime() > now.getTime() + 10 * 60 * 1000) {
            // Check conflict with existing bookings (including mentor relaxation/transition buffer)
            const hasConflict = existingBookings.some((b) => {
              const bStart = new Date(b.scheduledStart).getTime();
              const bEnd = new Date(b.scheduledEnd).getTime();
              if (
                slotStart.getTime() < bEnd + bufferMs &&
                slotEnd.getTime() > bStart - bufferMs
              ) {
                return true;
              }

              // Also block replacement slot if a reschedule request is in-flight
              if (b.status === 'RESCHEDULE_REQUESTED' && b.rescheduledStart && b.rescheduledEnd) {
                const rStart = new Date(b.rescheduledStart).getTime();
                const rEnd = new Date(b.rescheduledEnd).getTime();
                if (
                  slotStart.getTime() < rEnd + bufferMs &&
                  slotEnd.getTime() > rStart - bufferMs
                ) {
                  return true;
                }
              }

              return false;
            });

            if (!hasConflict) {
              const startParts = utcToLocalParts(slotStart, mentorTimezone);
              const endParts = utcToLocalParts(slotEnd, mentorTimezone);

              availableSlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                displayTime: `${startParts.timeStr} - ${endParts.timeStr}`,
                date: dateStr,
              });
            }
          }

          // Advance to next slot with relaxation / switch slack interval (e.g. 45m meeting + 15m slack = 60m cycle)
          slotStart = new Date(slotEnd.getTime() + bufferMs);
        }
      }

      curCal.setUTCDate(curCal.getUTCDate() + 1);
    }

    return availableSlots;
  }

  /**
   * Candidate slot-discovery engine.
   * Validates mentor approval, service active status and ownership,
   * enforces date range bounds, and calculates available slots via getAvailableSlots.
   */
  static async getCandidateSlots(params: {
    mentorId: string;
    serviceId: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    timezone?: string;
    bufferMinutes?: number;
  }): Promise<CandidateAvailableSlotsResponseDTO> {
    const { mentorId, serviceId } = params;
    const bufferMinutes =
      params.bufferMinutes !== undefined ? Math.max(0, params.bufferMinutes) : DEFAULT_MENTOR_BUFFER_MINUTES;

    // Validate mentorId & serviceId format (MongoDB 24-char hex)
    if (!mentorId || !/^[0-9a-fA-F]{24}$/.test(mentorId)) {
      throw new Error('Invalid mentor ID format');
    }
    if (!serviceId || !/^[0-9a-fA-F]{24}$/.test(serviceId)) {
      throw new Error('Invalid service ID format');
    }

    // 1. Verify mentor exists and is APPROVED
    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
      select: { id: true, status: true },
    });

    if (!mentor || mentor.status !== 'APPROVED') {
      throw new Error('Mentor is not available for bookings');
    }

    // 2. Verify service exists, belongs to mentor, and is active
    const service = await db.mentorshipService.findUnique({
      where: { id: serviceId },
      select: { id: true, mentorId: true, title: true, duration: true, price: true, active: true },
    });

    if (!service || service.mentorId !== mentorId || !service.active) {
      throw new Error('Mentorship service is not currently active or available');
    }

    // 3. Resolve mentor timezone early from active availability rules
    const rules = await db.availabilityRule.findMany({
      where: { mentorId, active: true },
    });
    const mentorTimezone = params.timezone || rules[0]?.timezone || 'Asia/Kolkata';

    // 4. Resolve date range
    let startDate = params.date || params.startDate;
    let endDate = params.date || params.endDate || params.startDate;

    if (!startDate) {
      // Default to today in mentor's local timezone
      const localNow = utcToLocalParts(new Date(), mentorTimezone);
      startDate = localNow.dateStr;
      endDate = localNow.dateStr;
    }

    if (!endDate) {
      endDate = startDate;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error('Dates must be in YYYY-MM-DD format');
    }

    const [sY, sM, sD] = startDate.split('-').map(Number);
    const [eY, eM, eD] = endDate.split('-').map(Number);
    const startUtc = Date.UTC(sY, sM - 1, sD);
    const endUtc = Date.UTC(eY, eM - 1, eD);

    if (endUtc < startUtc) {
      throw new Error('endDate cannot be before startDate');
    }

    const diffDays = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 14) {
      throw new Error('Requested availability window cannot exceed 14 days');
    }

    // 5. Get available slots via source-of-truth availability engine with 15m relaxation buffer
    const slots = await this.getAvailableSlots({
      mentorId,
      startDate,
      endDate,
      durationMinutes: service.duration,
      timezone: mentorTimezone,
      bufferMinutes,
    });

    return {
      mentorId,
      serviceId,
      service: {
        id: service.id,
        title: service.title,
        duration: service.duration,
        price: service.price,
      },
      timezone: mentorTimezone,
      startDate,
      endDate,
      bufferMinutes,
      slots,
    };
  }

  /**
   * Validates whether a requested booking time interval [start, end] fits strictly
   * within a mentor's availability rules and date-specific exceptions.
   * Throws an informative Error if unavailable.
   */
  static async validateSlotAvailability(
    mentorId: string,
    start: Date,
    end: Date
  ): Promise<{ timezone: string; localDate: string }> {
    const rules = await db.availabilityRule.findMany({
      where: { mentorId, active: true },
    });

    if (rules.length === 0) {
      throw new Error('Mentor has not configured any availability rules.');
    }

    const timezone = rules[0]?.timezone || 'Asia/Kolkata';

    const startLocal = utcToLocalParts(start, timezone);
    const endLocal = utcToLocalParts(end, timezone);

    // Ensure slot does not cross midnight in mentor local time
    if (startLocal.dateStr !== endLocal.dateStr) {
      throw new Error('Requested booking slot cannot cross midnight in mentor local time.');
    }

    const localDateStr = startLocal.dateStr;
    const dayOfWeek = startLocal.dayOfWeek;

    // Check date-specific exceptions first (exceptions override weekly recurring rules)
    const exception = await db.availabilityException.findFirst({
      where: { mentorId, date: localDateStr },
    });

    if (exception) {
      if (exception.type === 'UNAVAILABLE') {
        const reasonSuffix = exception.reason ? `: ${exception.reason}` : '.';
        throw new Error(`Mentor is unavailable on this date (${localDateStr})${reasonSuffix}`);
      }

      if (exception.type === 'CUSTOM_HOURS' && exception.startTime && exception.endTime) {
        const [sh, sm] = exception.startTime.split(':').map(Number);
        const [eh, em] = exception.endTime.split(':').map(Number);
        const windowStart = localToUtc(startLocal.year, startLocal.month, startLocal.day, sh, sm, timezone);
        const windowEnd = localToUtc(startLocal.year, startLocal.month, startLocal.day, eh, em, timezone);

        if (start.getTime() < windowStart.getTime() || end.getTime() > windowEnd.getTime()) {
          throw new Error(
            `Requested booking time falls outside mentor's custom available hours (${exception.startTime} - ${exception.endTime} ${timezone}) on ${localDateStr}.`
          );
        }

        return { timezone, localDate: localDateStr };
      }
    }

    // No exception applies: evaluate standard weekly rule for this day of the week
    const rule = rules.find((r) => r.dayOfWeek === dayOfWeek);
    if (!rule) {
      throw new Error(`Mentor has no configured availability on ${DAY_NAMES[dayOfWeek] || 'this day'}.`);
    }

    const [sh, sm] = rule.startTime.split(':').map(Number);
    const [eh, em] = rule.endTime.split(':').map(Number);
    const windowStart = localToUtc(startLocal.year, startLocal.month, startLocal.day, sh, sm, timezone);
    const windowEnd = localToUtc(startLocal.year, startLocal.month, startLocal.day, eh, em, timezone);

    if (start.getTime() < windowStart.getTime() || end.getTime() > windowEnd.getTime()) {
      throw new Error(
        `Requested booking time falls outside mentor's working hours (${rule.startTime} - ${rule.endTime} ${timezone}) on ${DAY_NAMES[dayOfWeek]}.`
      );
    }

    return { timezone, localDate: localDateStr };
  }

  /**
   * Computes weekly summary (active rules count, weekly available hours, timezone).
   */
  static async getAvailabilitySummary(mentorId: string): Promise<{
    activeRulesCount: number;
    weeklyAvailableHours: number;
    timezone: string;
    rules: AvailabilityRuleDTO[];
  }> {
    const rules = await this.getWeeklyRules(mentorId);
    const activeRules = rules.filter((r) => r.active);

    let totalHours = 0;
    for (const rule of activeRules) {
      const [sh, sm] = rule.startTime.split(':').map(Number);
      const [eh, em] = rule.endTime.split(':').map(Number);
      const durationMinutes = eh * 60 + em - (sh * 60 + sm);
      if (durationMinutes > 0) {
        totalHours += durationMinutes / 60;
      }
    }

    const timezone = rules[0]?.timezone || 'Asia/Kolkata';

    return {
      activeRulesCount: activeRules.length,
      weeklyAvailableHours: Math.round(totalHours * 10) / 10,
      timezone,
      rules,
    };
  }
}
