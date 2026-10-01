import { db } from '../../db/client';
import {
  AvailabilityRuleDTO,
  AvailabilityExceptionDTO,
  AvailableSlotDTO,
} from '../../types/mentorship';
import {
  AvailabilityRuleInputSchema,
  SetWeeklyAvailabilitySchema,
  AvailabilityExceptionSchema,
} from '../../validations/mentorshipSchemas';
import { z } from 'zod';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class AvailabilityService {
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
   * Server is source of truth. Bounded to max 30 days.
   */
  static async getAvailableSlots(params: {
    mentorId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    durationMinutes: number; // e.g. 30, 45, 60
  }): Promise<AvailableSlotDTO[]> {
    const { mentorId, startDate, endDate, durationMinutes } = params;

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Safety: Cap date range to max 31 days
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 31) {
      throw new Error('Requested availability window cannot exceed 31 days');
    }

    // Fetch active rules, exceptions in range, and existing bookings
    const [rules, exceptions, existingBookings] = await Promise.all([
      db.availabilityRule.findMany({
        where: { mentorId, active: true },
      }),
      db.availabilityException.findMany({
        where: {
          mentorId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      db.booking.findMany({
        where: {
          mentorId,
          status: { in: ['CONFIRMED', 'PENDING'] },
          scheduledStart: { lte: end },
          scheduledEnd: { gte: start },
        },
        select: {
          scheduledStart: true,
          scheduledEnd: true,
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

    // Iterate through each day in the date range
    const current = new Date(start);
    while (current <= end) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, '0');
      const day = String(current.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = current.getUTCDay();

      const dayException = exceptionMap.get(dateStr);
      let dayStartHour: number | null = null;
      let dayStartMin: number = 0;
      let dayEndHour: number | null = null;
      let dayEndMin: number = 0;

      if (dayException) {
        if (dayException.type === 'UNAVAILABLE') {
          // Entire day blocked
          current.setUTCDate(current.getUTCDate() + 1);
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
        // Construct prospective slots in steps of durationMinutes
        const windowStart = new Date(Date.UTC(year, Number(month) - 1, Number(day), dayStartHour, dayStartMin, 0));
        const windowEnd = new Date(Date.UTC(year, Number(month) - 1, Number(day), dayEndHour, dayEndMin, 0));

        let slotStart = new Date(windowStart);
        while (slotStart.getTime() + durationMinutes * 60 * 1000 <= windowEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

          // Discard past slots (allow 10-minute buffer from now)
          if (slotStart.getTime() > now.getTime() + 10 * 60 * 1000) {
            // Check conflict with existing bookings
            const hasConflict = existingBookings.some((b) => {
              const bStart = new Date(b.scheduledStart).getTime();
              const bEnd = new Date(b.scheduledEnd).getTime();
              return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
            });

            if (!hasConflict) {
              const startIso = slotStart.toISOString();
              const endIso = slotEnd.toISOString();
              const hours = String(slotStart.getUTCHours()).padStart(2, '0');
              const mins = String(slotStart.getUTCMinutes()).padStart(2, '0');
              const endHours = String(slotEnd.getUTCHours()).padStart(2, '0');
              const endMins = String(slotEnd.getUTCMinutes()).padStart(2, '0');

              availableSlots.push({
                start: startIso,
                end: endIso,
                displayTime: `${hours}:${mins} - ${endHours}:${endMins} UTC`,
                date: dateStr,
              });
            }
          }

          // Advance slot
          slotStart = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        }
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return availableSlots;
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
