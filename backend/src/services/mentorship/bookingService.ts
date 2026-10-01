import { db } from '../../db/client';
import {
  BookingListDTO,
  BookingDetailDTO,
  BookingStatus,
  MentorshipCategory,
  PaginatedResult,
} from '../../types/mentorship';
import { CreateBookingSchema, UpdateBookingStatusSchema } from '../../validations/mentorshipSchemas';
import { z } from 'zod';

export interface ListBookingsParams {
  mentorId: string;
  tab?: 'upcoming' | 'pending' | 'completed' | 'cancelled';
  status?: string;
  serviceId?: string;
  search?: string; // student name or email
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class BookingService {
  /**
   * Concurrency-safe slot booking.
   * Requirement 14: Double booking prevention on server side.
   */
  static async createBooking(
    candidateId: string,
    data: z.infer<typeof CreateBookingSchema>
  ): Promise<BookingDetailDTO> {
    const validated = CreateBookingSchema.parse(data);

    // 1. Verify mentor status
    const mentor = await db.mentor.findUnique({
      where: { id: validated.mentorId },
    });
    if (!mentor || mentor.status !== 'APPROVED') {
      throw new Error('Mentor is not available for bookings.');
    }

    // 2. Verify service
    const service = await db.mentorshipService.findUnique({
      where: { id: validated.serviceId },
    });
    if (!service || service.mentorId !== validated.mentorId || !service.active) {
      throw new Error('Mentorship service is not currently active or available.');
    }

    const start = new Date(validated.scheduledStart);
    if (isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      throw new Error('Scheduled start time must be a valid future datetime.');
    }

    const end = new Date(start.getTime() + service.duration * 60 * 1000);

    // 3. Concurrency check: Ensure no overlapping confirmed or pending bookings exist
    const conflicting = await db.booking.findFirst({
      where: {
        mentorId: validated.mentorId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
      },
    });

    if (conflicting) {
      throw new Error('This time slot was just reserved by another candidate. Please select another slot.');
    }

    // 4. Create booking and auto-initialize MentorshipSession in transaction
    const booking = await db.booking.create({
      data: {
        mentorId: validated.mentorId,
        candidateId,
        serviceId: validated.serviceId,
        scheduledStart: start,
        scheduledEnd: end,
        timezone: validated.timezone,
        status: 'CONFIRMED',
        studentNotes: validated.studentNotes || null,
        session: {
          create: {
            mentorId: validated.mentorId,
            candidateId,
            status: 'SCHEDULED',
            meetingUrl: `https://meet.pathway.eco/room/${validated.mentorId.slice(-6)}-${Date.now().toString(36)}`,
          },
        },
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: {
              select: {
                headline: true,
                candidateType: true,
              },
            },
          },
        },
        service: true,
        session: true,
      },
    });

    // Increment mentor's sessionCount
    await db.mentor.update({
      where: { id: validated.mentorId },
      data: { sessionCount: { increment: 1 } },
    }).catch(() => {});

    return this.toDetailDTO(booking);
  }

  /**
   * Lists paginated bookings for a mentor.
   * Requirement 16, 29, 30: Server-side pagination (default 25, max 100), lightweight DTO projection.
   */
  static async listBookings(params: ListBookingsParams): Promise<PaginatedResult<BookingListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {
      mentorId: params.mentorId,
    };

    // Tab-based status mapping
    if (params.tab === 'upcoming') {
      where.status = 'CONFIRMED';
      where.scheduledStart = { gte: new Date() };
    } else if (params.tab === 'pending') {
      where.status = { in: ['PENDING', 'RESCHEDULE_REQUESTED'] };
    } else if (params.tab === 'completed') {
      where.status = 'COMPLETED';
    } else if (params.tab === 'cancelled') {
      where.status = { in: ['CANCELLED_BY_CANDIDATE', 'CANCELLED_BY_MENTOR', 'NO_SHOW'] };
    } else if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.serviceId && params.serviceId !== 'ALL') {
      where.serviceId = params.serviceId;
    }

    if (params.startDate && params.endDate) {
      where.scheduledStart = {
        gte: new Date(params.startDate),
        lte: new Date(params.endDate),
      };
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.candidate = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const [total, bookings] = await Promise.all([
      db.booking.count({ where }),
      db.booking.findMany({
        where,
        select: {
          id: true,
          mentorId: true,
          scheduledStart: true,
          scheduledEnd: true,
          timezone: true,
          status: true,
          studentNotes: true,
          createdAt: true,
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              profile: {
                select: {
                  headline: true,
                  candidateType: true,
                },
              },
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              category: true,
              duration: true,
              price: true,
              currency: true,
            },
          },
          session: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { scheduledStart: params.tab === 'completed' || params.tab === 'cancelled' ? 'desc' : 'asc' },
        skip,
        take: limit,
      }),
    ]);

    const items: BookingListDTO[] = bookings.map((b) => ({
      id: b.id,
      mentorId: b.mentorId,
      candidate: {
        id: b.candidate.id,
        name: b.candidate.name,
        email: b.candidate.email,
        avatarUrl: b.candidate.avatarUrl,
        headline: b.candidate.profile?.headline || null,
        candidateType: b.candidate.profile?.candidateType || null,
      },
      service: {
        id: b.service.id,
        title: b.service.title,
        category: b.service.category as MentorshipCategory,
        duration: b.service.duration,
        price: b.service.price,
        currency: b.service.currency,
      },
      scheduledStart: b.scheduledStart.toISOString(),
      scheduledEnd: b.scheduledEnd.toISOString(),
      timezone: b.timezone,
      status: b.status as BookingStatus,
      studentNotes: b.studentNotes,
      createdAt: b.createdAt.toISOString(),
      hasSession: !!b.session,
      sessionId: b.session?.id || null,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves single booking detail with ownership check.
   */
  static async getBookingDetail(bookingId: string, mentorId: string): Promise<BookingDetailDTO | null> {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: {
              select: {
                headline: true,
                candidateType: true,
              },
            },
          },
        },
        service: true,
        session: true,
      },
    });

    if (!booking) return null;
    if (booking.mentorId !== mentorId) {
      throw new Error('Unauthorized access to booking');
    }

    return this.toDetailDTO(booking);
  }

  /**
   * Updates booking status (confirm, cancel, complete, reschedule).
   */
  static async updateBookingStatus(
    bookingId: string,
    mentorId: string,
    data: z.infer<typeof UpdateBookingStatusSchema>
  ): Promise<BookingDetailDTO> {
    const validated = UpdateBookingStatusSchema.parse(data);

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.mentorId !== mentorId) {
      throw new Error('Booking not found or unauthorized');
    }

    const updateData: any = {
      status: validated.status,
    };

    if (validated.status.startsWith('CANCELLED') && validated.reason) {
      updateData.cancellationReason = validated.reason;
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: {
              select: {
                headline: true,
                candidateType: true,
              },
            },
          },
        },
        service: true,
        session: true,
      },
    });

    // If marked completed, sync session status
    if (validated.status === 'COMPLETED' && updated.session) {
      await db.mentorshipSession.update({
        where: { id: updated.session.id },
        data: { status: 'COMPLETED', endedAt: new Date() },
      }).catch(() => {});
    }

    return this.toDetailDTO(updated);
  }

  private static toDetailDTO(b: any): BookingDetailDTO {
    let sessionDTO = null;
    if (b.session) {
      let actionItems = [];
      if (b.session.actionItems) {
        try {
          actionItems = JSON.parse(b.session.actionItems);
        } catch {
          actionItems = [];
        }
      }
      sessionDTO = {
        id: b.session.id,
        bookingId: b.session.bookingId,
        mentorId: b.session.mentorId,
        candidateId: b.session.candidateId,
        startedAt: b.session.startedAt?.toISOString() || null,
        endedAt: b.session.endedAt?.toISOString() || null,
        meetingUrl: b.session.meetingUrl,
        notes: b.session.notes,
        actionItems,
        status: b.session.status,
        createdAt: b.session.createdAt.toISOString(),
        updatedAt: b.session.updatedAt.toISOString(),
      };
    }

    return {
      id: b.id,
      mentorId: b.mentorId,
      candidate: {
        id: b.candidate.id,
        name: b.candidate.name,
        email: b.candidate.email,
        avatarUrl: b.candidate.avatarUrl,
        headline: b.candidate.profile?.headline || null,
        candidateType: b.candidate.profile?.candidateType || null,
      },
      service: {
        id: b.service.id,
        title: b.service.title,
        category: b.service.category as MentorshipCategory,
        duration: b.service.duration,
        price: b.service.price,
        currency: b.service.currency,
      },
      scheduledStart: b.scheduledStart.toISOString(),
      scheduledEnd: b.scheduledEnd.toISOString(),
      timezone: b.timezone,
      status: b.status as BookingStatus,
      studentNotes: b.studentNotes,
      cancellationReason: b.cancellationReason,
      rescheduledFromId: b.rescheduledFromId,
      createdAt: b.createdAt.toISOString(),
      hasSession: !!b.session,
      sessionId: b.session?.id || null,
      session: sessionDTO,
    };
  }
}
