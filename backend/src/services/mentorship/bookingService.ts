import { db } from '../../db/client';
import {
  BookingListDTO,
  BookingDetailDTO,
  BookingStatus,
  CandidateBookingDTO,
  ListCandidateBookingsParams,
  MentorshipCategory,
  PaginatedResult,
} from '../../types/mentorship';
import {
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  CandidateCancelBookingSchema,
  CandidateRescheduleBookingSchema,
} from '../../validations/mentorshipSchemas';
import { AvailabilityService } from './availabilityService';
import { AuditService } from '../auditService';
import { EmailService } from '../email/emailService';
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

    // 3. Confirm that the complete requested interval fits within mentor's availability rules & exceptions
    const { timezone: mentorTimezone } = await AvailabilityService.validateSlotAvailability(
      validated.mentorId,
      start,
      end
    );

    // 4. Concurrency-safe slot reservation with MongoDB replica set transaction locking & retry
    const MAX_RETRIES = 8;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const booking = await db.$transaction(
          async (tx) => {
            // 4a. Serialize booking operations on this mentor by acquiring a write lock on the Mentor document.
            // In MongoDB replica set transactions, updating the dedicated `bookingVersion` field on the parent
            // Mentor document acquires a document write lock without mutating business counters (such as `sessionCount`).
            // Any concurrent transaction attempting to book with this mentor will trigger a MongoDB WriteConflict (P2034)
            // and safely retry with a fresh snapshot.
            await tx.mentor.update({
              where: { id: validated.mentorId },
              data: {
                bookingVersion: { increment: 1 },
              },
            });

            // 4b. Concurrency check: Ensure no overlapping confirmed, pending, or requested reschedule bookings exist in this snapshot
            const conflicting = await tx.booking.findFirst({
              where: {
                mentorId: validated.mentorId,
                status: { in: ['CONFIRMED', 'PENDING', 'RESCHEDULE_REQUESTED'] },
                OR: [
                  {
                    scheduledStart: { lt: end },
                    scheduledEnd: { gt: start },
                  },
                  {
                    status: 'RESCHEDULE_REQUESTED',
                    rescheduledStart: { not: null, lt: end },
                    rescheduledEnd: { not: null, gt: start },
                  },
                ],
              },
            });

            if (conflicting) {
              throw new Error('This time slot was just reserved by another candidate. Please select another slot.');
            }

            // 5. Create booking and auto-initialize MentorshipSession atomically in transaction
            return await tx.booking.create({
              data: {
                mentorId: validated.mentorId,
                candidateId,
                serviceId: validated.serviceId,
                scheduledStart: start,
                scheduledEnd: end,
                timezone: validated.timezone || mentorTimezone || 'Asia/Kolkata',
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
                mentor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                service: true,
                session: true,
              },
            });
          },
          { maxWait: 8000, timeout: 15000 }
        );

        // Transaction successfully committed.
        // Dispatch booking confirmation to student and new booking notification to mentor.
        // Delivery failures are caught and logged, never rolling back the committed booking transaction.
        try {
          await EmailService.sendMentorshipBookingCreatedNotifications({
            bookingId: booking.id,
            studentName: booking.candidate?.name || 'Student',
            studentEmail: booking.candidate?.email || '',
            mentorName: booking.mentor?.name || mentor.name,
            mentorEmail: booking.mentor?.email || mentor.email,
            serviceTitle: booking.service?.title || service.title,
            scheduledStart: booking.scheduledStart,
            scheduledEnd: booking.scheduledEnd,
            timezone: booking.timezone,
            duration: booking.service?.duration || service.duration,
          });
        } catch (err: any) {
          console.error(`[BookingService] Failed to dispatch booking creation emails for ${booking.id}:`, err?.message || err);
        }

        return this.toDetailDTO(booking);
      } catch (err: any) {
        lastError = err;

        // Fail closed if the database does not support multi-document replica set transactions.
        // Never silently fall back to non-atomic query-and-create logic in production.
        const isReplicaSetMissing =
          (err.code === 'P2028' && (err.message?.includes('replica set') || err.message?.includes('mongos'))) ||
          (err.message && err.message.includes('requires a replica set'));

        if (isReplicaSetMissing) {
          console.error(
            '[BookingService] MongoDB replica set transaction support is required for concurrency-safe booking creation. Deployment requires a replica set or mongos cluster.',
            err
          );
          throw new Error(
            'Mentorship booking service is unavailable: database transactions are not supported by the current database configuration. A MongoDB replica set is required.'
          );
        }

        const isWriteConflict =
          err.code === 'P2034' ||
          err.code === 'P2028' ||
          (err.message && (
            err.message.includes('WriteConflict') ||
            err.message.includes('write conflict') ||
            err.message.includes('Transaction already closed') ||
            err.message.includes('expired transaction')
          ));

        if (isWriteConflict && attempt < MAX_RETRIES) {
          // Full-jitter exponential backoff for high-contention MongoDB transactions
          const baseDelay = 40 * Math.pow(1.5, attempt);
          const jitter = Math.random() * 150;
          const delay = Math.min(800, baseDelay + jitter);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Rethrow domain/validation/conflict errors immediately
        throw err;
      }
    }

    if (lastError) {
      if (lastError.code === 'P2034' || lastError.message?.includes('write conflict')) {
        throw new Error('The booking system is currently experiencing high contention. Please try again in a moment.');
      }
      throw lastError;
    }

    throw new Error('Failed to create booking due to high contention.');
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
              meetingUrl: true,
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
      meetingUrl: b.session?.meetingUrl || null,
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
   * Updates booking status (confirm, cancel, complete, reschedule approval/rejection).
   * Fully serialized on Mentor.bookingVersion with replica-set transaction.
   */
  static async updateBookingStatus(
    bookingId: string,
    mentorId: string,
    data: z.infer<typeof UpdateBookingStatusSchema>,
    ipAddress?: string | null
  ): Promise<BookingDetailDTO> {
    if (!bookingId || !/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      const err: any = new Error('Invalid booking ID format');
      err.statusCode = 400;
      throw err;
    }
    if (!mentorId || !/^[0-9a-fA-F]{24}$/.test(mentorId)) {
      const err: any = new Error('Invalid mentor ID format');
      err.statusCode = 400;
      throw err;
    }

    const parsed = UpdateBookingStatusSchema.safeParse(data);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const err: any = new Error(issue ? issue.message : 'Invalid booking update payload');
      err.statusCode = 400;
      throw err;
    }
    const validated = parsed.data;

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await db.$transaction(
          async (tx) => {
            const booking = await tx.booking.findUnique({
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
                mentor: {
                  select: { id: true, name: true, email: true },
                },
                service: true,
                session: true,
              },
            });

            if (!booking || booking.mentorId !== mentorId) {
              const err: any = new Error('Booking not found or unauthorized');
              err.statusCode = 403;
              throw err;
            }

            // Serialize on Mentor document write lock
            await tx.mentor.update({
              where: { id: mentorId },
              data: { bookingVersion: { increment: 1 } },
            });

            const isApproval =
              validated.action === 'APPROVE_RESCHEDULE' ||
              (booking.status === 'RESCHEDULE_REQUESTED' &&
                validated.status === 'CONFIRMED' &&
                validated.action !== 'REJECT_RESCHEDULE');

            const isRejection = validated.action === 'REJECT_RESCHEDULE';

            const isCancellation =
              validated.action === 'CANCEL' ||
              validated.status === 'CANCELLED_BY_MENTOR' ||
              validated.status === 'CANCELLED_BY_CANDIDATE';

            const isCompletion =
              validated.action === 'COMPLETE' || validated.status === 'COMPLETED';

            const isConfirmPending =
              booking.status === 'PENDING' &&
              (validated.status === 'CONFIRMED' || validated.action === 'CONFIRM');

            // 1. Reschedule Approval
            if (isApproval) {
              if (booking.status !== 'RESCHEDULE_REQUESTED') {
                const err: any = new Error(
                  `Booking is not awaiting reschedule approval (current status: ${booking.status})`
                );
                err.statusCode = 409;
                throw err;
              }

              if (!booking.rescheduledStart || !booking.rescheduledEnd) {
                const err: any = new Error('No replacement slot requested for this booking.');
                err.statusCode = 400;
                throw err;
              }

              // Re-check collision on replacement slot
              const conflict = await tx.booking.findFirst({
                where: {
                  mentorId,
                  id: { not: bookingId },
                  status: { in: ['CONFIRMED', 'PENDING', 'RESCHEDULE_REQUESTED'] },
                  OR: [
                    {
                      scheduledStart: { lt: booking.rescheduledEnd },
                      scheduledEnd: { gt: booking.rescheduledStart },
                    },
                    {
                      status: 'RESCHEDULE_REQUESTED',
                      rescheduledStart: { not: null, lt: booking.rescheduledEnd },
                      rescheduledEnd: { not: null, gt: booking.rescheduledStart },
                    },
                  ],
                },
              });

              if (conflict) {
                const err: any = new Error(
                  'The requested replacement slot conflicts with another reservation.'
                );
                err.statusCode = 409;
                throw err;
              }

              const newMeetingUrl =
                booking.session?.meetingUrl ||
                `https://meet.pathway.eco/room/${mentorId.slice(-6)}-${Date.now().toString(36)}`;

              if (booking.session) {
                await tx.mentorshipSession.update({
                  where: { id: booking.session.id },
                  data: {
                    status: 'SCHEDULED',
                    meetingUrl: newMeetingUrl,
                  },
                });
              }

              const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                  scheduledStart: booking.rescheduledStart,
                  scheduledEnd: booking.rescheduledEnd,
                  rescheduledStart: null,
                  rescheduledEnd: null,
                  status: 'CONFIRMED',
                  cancellationReason: null,
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
                  mentor: {
                    select: { id: true, name: true, email: true },
                  },
                  service: true,
                  session: true,
                },
              });

              return {
                booking: updatedBooking,
                auditAction: 'BOOKING_RESCHEDULE_APPROVED',
                actorId: mentorId,
                actorEmail: booking.mentor?.email,
                actorName: booking.mentor?.name,
              };
            }

            // 2. Reschedule Rejection (restore original confirmed schedule)
            if (isRejection) {
              if (booking.status !== 'RESCHEDULE_REQUESTED') {
                const err: any = new Error(
                  `Booking is not awaiting reschedule approval (current status: ${booking.status})`
                );
                err.statusCode = 409;
                throw err;
              }

              const restoredMeetingUrl =
                booking.session?.meetingUrl ||
                `https://meet.pathway.eco/room/${mentorId.slice(-6)}-${Date.now().toString(36)}`;

              if (booking.session) {
                await tx.mentorshipSession.update({
                  where: { id: booking.session.id },
                  data: {
                    status: 'SCHEDULED',
                    meetingUrl: restoredMeetingUrl,
                  },
                });
              }

              // Revert status to CONFIRMED and clear requested replacement slot.
              // Note: scheduledStart and scheduledEnd are preserved intact at their original confirmed values!
              const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                  rescheduledStart: null,
                  rescheduledEnd: null,
                  status: 'CONFIRMED',
                  cancellationReason: validated.reason || 'Reschedule request declined by mentor',
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
                  mentor: {
                    select: { id: true, name: true, email: true },
                  },
                  service: true,
                  session: true,
                },
              });

              return {
                booking: updatedBooking,
                auditAction: 'BOOKING_RESCHEDULE_REJECTED',
                actorId: mentorId,
                actorEmail: booking.mentor?.email,
                actorName: booking.mentor?.name,
              };
            }

            // 3. Cancellation by Mentor
            if (isCancellation) {
              if (
                booking.status === 'CANCELLED_BY_MENTOR' ||
                booking.status === 'CANCELLED_BY_CANDIDATE'
              ) {
                const err: any = new Error('Booking has already been cancelled');
                err.statusCode = 409;
                throw err;
              }

              if (booking.status === 'COMPLETED') {
                const err: any = new Error('Completed sessions cannot be cancelled');
                err.statusCode = 400;
                throw err;
              }

              const targetStatus =
                validated.status === 'CANCELLED_BY_CANDIDATE'
                  ? 'CANCELLED_BY_CANDIDATE'
                  : 'CANCELLED_BY_MENTOR';

              const defaultReason =
                targetStatus === 'CANCELLED_BY_CANDIDATE'
                  ? 'Cancelled by candidate'
                  : 'Cancelled by mentor';

              const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                  status: targetStatus,
                  cancellationReason: validated.reason || defaultReason,
                  rescheduledStart: null,
                  rescheduledEnd: null,
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
                  mentor: {
                    select: { id: true, name: true, email: true },
                  },
                  service: true,
                  session: true,
                },
              });

              if (booking.session) {
                await tx.mentorshipSession.update({
                  where: { id: booking.session.id },
                  data: {
                    status: 'CANCELLED',
                    meetingUrl: null,
                  },
                });
              }

              return {
                booking: updatedBooking,
                auditAction:
                  targetStatus === 'CANCELLED_BY_CANDIDATE'
                    ? 'BOOKING_CANCELLED_BY_CANDIDATE'
                    : 'BOOKING_CANCELLED_BY_MENTOR',
                actorId: mentorId,
                actorEmail: booking.mentor?.email,
                actorName: booking.mentor?.name,
              };
            }

            // 4. Completion
            if (isCompletion) {
              if (booking.status !== 'CONFIRMED') {
                const err: any = new Error('Only confirmed bookings can be marked completed');
                err.statusCode = 400;
                throw err;
              }

              const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                  status: 'COMPLETED',
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
                  mentor: {
                    select: { id: true, name: true, email: true },
                  },
                  service: true,
                  session: true,
                },
              });

              if (booking.session) {
                await tx.mentorshipSession.update({
                  where: { id: booking.session.id },
                  data: {
                    status: 'COMPLETED',
                    endedAt: new Date(),
                  },
                });
              }

              return {
                booking: updatedBooking,
                auditAction: 'BOOKING_COMPLETED',
                actorId: mentorId,
                actorEmail: booking.mentor?.email,
                actorName: booking.mentor?.name,
              };
            }

            // 5. Standard Confirmation (PENDING -> CONFIRMED)
            if (isConfirmPending) {
              const meetingUrl =
                booking.session?.meetingUrl ||
                `https://meet.pathway.eco/room/${mentorId.slice(-6)}-${Date.now().toString(36)}`;

              const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                  status: 'CONFIRMED',
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
                  mentor: {
                    select: { id: true, name: true, email: true },
                  },
                  service: true,
                  session: true,
                },
              });

              if (booking.session) {
                await tx.mentorshipSession.update({
                  where: { id: booking.session.id },
                  data: {
                    status: 'SCHEDULED',
                    meetingUrl,
                  },
                });
              }

              return {
                booking: updatedBooking,
                auditAction: 'BOOKING_CONFIRMED',
                actorId: mentorId,
                actorEmail: booking.mentor?.email,
                actorName: booking.mentor?.name,
              };
            }

            // Default fallback status update
            const updateData: any = {};
            if (validated.status) updateData.status = validated.status;
            if (validated.reason) updateData.cancellationReason = validated.reason;

            const updatedBooking = await tx.booking.update({
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
                mentor: {
                  select: { id: true, name: true, email: true },
                },
                service: true,
                session: true,
              },
            });

            return {
              booking: updatedBooking,
              auditAction: 'BOOKING_UPDATED',
              actorId: mentorId,
              actorEmail: booking.mentor?.email,
              actorName: booking.mentor?.name,
            };
          },
          { maxWait: 15000, timeout: 30000 }
        );

        if (result.auditAction) {
          AuditService.log({
            actorId: result.actorId,
            actorEmail: result.actorEmail,
            actorName: result.actorName,
            action: result.auditAction,
            resourceType: 'Booking',
            resourceId: bookingId,
            details: {
              status: result.booking.status,
              reason: validated.reason || null,
            },
            ipAddress,
          }).catch(() => {});
        }

        // Dispatch transactional email notifications based on the committed state transition.
        // Delivery failures are caught and logged, never failing or rolling back the update.
        try {
          if (result.auditAction === 'BOOKING_RESCHEDULE_APPROVED') {
            await EmailService.sendMentorshipRescheduleApprovedEmail({
              bookingId,
              studentName: result.booking.candidate?.name || 'Student',
              studentEmail: result.booking.candidate?.email || '',
              mentorName: result.booking.mentor?.name || '',
              mentorEmail: result.booking.mentor?.email || '',
              serviceTitle: result.booking.service?.title || 'Mentorship Session',
              newStart: result.booking.scheduledStart,
              newEnd: result.booking.scheduledEnd,
              duration: result.booking.service?.duration,
              timezone: result.booking.timezone,
            });
          } else if (result.auditAction === 'BOOKING_RESCHEDULE_REJECTED') {
            await EmailService.sendMentorshipRescheduleRejectedEmail({
              bookingId,
              studentName: result.booking.candidate?.name || 'Student',
              studentEmail: result.booking.candidate?.email || '',
              mentorName: result.booking.mentor?.name || '',
              mentorEmail: result.booking.mentor?.email || '',
              serviceTitle: result.booking.service?.title || 'Mentorship Session',
              originalStart: result.booking.scheduledStart,
              originalEnd: result.booking.scheduledEnd,
              duration: result.booking.service?.duration,
              reason: validated.reason || result.booking.cancellationReason || null,
              timezone: result.booking.timezone,
            });
          } else if (result.auditAction === 'BOOKING_CANCELLED_BY_MENTOR') {
            await EmailService.sendMentorshipBookingCancelledByMentorEmail({
              bookingId,
              studentName: result.booking.candidate?.name || 'Student',
              studentEmail: result.booking.candidate?.email || '',
              mentorName: result.booking.mentor?.name || '',
              mentorEmail: result.booking.mentor?.email || '',
              serviceTitle: result.booking.service?.title || 'Mentorship Session',
              sessionStart: result.booking.scheduledStart,
              sessionEnd: result.booking.scheduledEnd,
              cancellationReason: validated.reason || result.booking.cancellationReason || null,
              timezone: result.booking.timezone,
            });
          } else if (result.auditAction === 'BOOKING_CONFIRMED') {
            await EmailService.sendMentorshipBookingCreatedNotifications({
              bookingId,
              studentName: result.booking.candidate?.name || 'Student',
              studentEmail: result.booking.candidate?.email || '',
              mentorName: result.booking.mentor?.name || '',
              mentorEmail: result.booking.mentor?.email || '',
              serviceTitle: result.booking.service?.title || 'Mentorship Session',
              scheduledStart: result.booking.scheduledStart,
              scheduledEnd: result.booking.scheduledEnd,
              duration: result.booking.service?.duration,
              timezone: result.booking.timezone,
            });
          }
        } catch (err: any) {
          console.error(`[BookingService] Failed to dispatch status update email for ${bookingId}:`, err?.message || err);
        }

        return this.toDetailDTO(result.booking);
      } catch (err: any) {
        const isReplicaSetMissing =
          (err.code === 'P2028' && (err.message?.includes('replica set') || err.message?.includes('mongos') || err.message?.includes('requires a replica set'))) ||
          (err.message && err.message.includes('requires a replica set'));

        if (isReplicaSetMissing) {
          console.error(
            '[BookingService] MongoDB replica set transaction support is required for concurrency-safe booking status updates.',
            err
          );
          throw new Error(
            'Mentorship booking service is unavailable: database transactions are not supported by the current database configuration. A MongoDB replica set is required.'
          );
        }

        const isWriteConflict =
          err.code === 'P2034' ||
          err.code === 'P2028' ||
          (err.message &&
            (err.message.includes('WriteConflict') ||
              err.message.includes('write conflict') ||
              err.message.includes('Transaction already closed') ||
              err.message.includes('expired transaction')));

        if (isWriteConflict && attempt < MAX_RETRIES) {
          const delay = 40 * Math.pow(1.5, attempt) + Math.random() * 100;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw err;
      }
    }

    const err: any = new Error('Failed to update booking status due to high contention. Please try again.');
    err.statusCode = 409;
    throw err;
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
        id: b.candidate?.id || '',
        name: b.candidate?.name || 'Candidate',
        email: b.candidate?.email || '',
        avatarUrl: b.candidate?.avatarUrl || null,
        headline: b.candidate?.profile?.headline || null,
        candidateType: b.candidate?.profile?.candidateType || null,
      },
      service: {
        id: b.service?.id || '',
        title: b.service?.title || 'Mentorship Session',
        category: (b.service?.category as MentorshipCategory) || 'CAREER_DIRECTION',
        duration: b.service?.duration || 45,
        price: b.service?.price ?? 0,
        currency: b.service?.currency || 'INR',
      },
      scheduledStart:
        b.scheduledStart instanceof Date ? b.scheduledStart.toISOString() : b.scheduledStart,
      scheduledEnd:
        b.scheduledEnd instanceof Date ? b.scheduledEnd.toISOString() : b.scheduledEnd,
      rescheduledStart: b.rescheduledStart
        ? (b.rescheduledStart instanceof Date ? b.rescheduledStart.toISOString() : b.rescheduledStart)
        : null,
      rescheduledEnd: b.rescheduledEnd
        ? (b.rescheduledEnd instanceof Date ? b.rescheduledEnd.toISOString() : b.rescheduledEnd)
        : null,
      timezone: b.timezone,
      status: b.status as BookingStatus,
      studentNotes: b.studentNotes,
      cancellationReason: b.cancellationReason,
      rescheduledFromId: b.rescheduledFromId,
      createdAt:
        b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      hasSession: !!b.session,
      sessionId: b.session?.id || null,
      session: sessionDTO,
    };
  }

  /**
   * Lists paginated bookings belonging to an authenticated candidate.
   * Ensures candidate ID is strictly derived from server session.
   * Projects safe public mentor information without exposing private or internal fields.
   */
  static async listCandidateBookings(
    candidateId: string,
    params: Omit<ListCandidateBookingsParams, 'candidateId'>
  ): Promise<PaginatedResult<CandidateBookingDTO>> {
    if (!candidateId || !/^[0-9a-fA-F]{24}$/.test(candidateId)) {
      throw new Error('Invalid candidate ID format');
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      candidateId,
    };

    const now = new Date();

    if (params.tab === 'upcoming') {
      where.status = { in: ['CONFIRMED', 'PENDING', 'RESCHEDULE_REQUESTED'] };
      where.scheduledStart = { gte: now };
    } else if (params.tab === 'past') {
      where.OR = [
        { status: 'COMPLETED' },
        {
          scheduledEnd: { lt: now },
          status: { notIn: ['CANCELLED_BY_CANDIDATE', 'CANCELLED_BY_MENTOR'] },
        },
      ];
    } else if (params.tab === 'cancelled') {
      where.status = { in: ['CANCELLED_BY_CANDIDATE', 'CANCELLED_BY_MENTOR', 'NO_SHOW'] };
    } else if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    const orderBy: any =
      params.tab === 'past' || params.tab === 'cancelled'
        ? { scheduledStart: 'desc' }
        : { scheduledStart: 'asc' };

    const [total, bookings] = await Promise.all([
      db.booking.count({ where }),
      db.booking.findMany({
        where,
        select: {
          id: true,
          mentorId: true,
          candidateId: true,
          scheduledStart: true,
          scheduledEnd: true,
          timezone: true,
          status: true,
          studentNotes: true,
          cancellationReason: true,
          createdAt: true,
          mentor: {
            select: {
              id: true,
              name: true,
              avatar: true,
              headline: true,
              company: true,
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
              status: true,
              meetingUrl: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const items: CandidateBookingDTO[] = bookings.map((b) => this.toCandidateDTO(b));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves single booking detail with strict candidate ownership verification (IDOR protection).
   */
  static async getCandidateBookingDetail(
    bookingId: string,
    candidateId: string
  ): Promise<CandidateBookingDTO | null> {
    if (!bookingId || !/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      throw new Error('Invalid booking ID format');
    }
    if (!candidateId || !/^[0-9a-fA-F]{24}$/.test(candidateId)) {
      throw new Error('Invalid candidate ID format');
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        mentorId: true,
        candidateId: true,
        scheduledStart: true,
        scheduledEnd: true,
        timezone: true,
        status: true,
        studentNotes: true,
        cancellationReason: true,
        createdAt: true,
        mentor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
            company: true,
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
            status: true,
            meetingUrl: true,
          },
        },
      },
    });

    if (!booking) return null;
    if (booking.candidateId !== candidateId) {
      throw new Error('Booking not found or unauthorized');
    }

    return this.toCandidateDTO(booking);
  }

  /**
   * Candidate-initiated booking cancellation.
   * Atomically transitions booking status to CANCELLED_BY_CANDIDATE,
   * cancels any linked session, releases availability slot,
   * records audit log, and guards against concurrency / double-cancellation.
   */
  static async cancelBookingByCandidate(
    bookingId: string,
    candidateId: string,
    reason?: string | null,
    ipAddress?: string | null
  ): Promise<CandidateBookingDTO> {
    if (!bookingId || !/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      throw new Error('Invalid booking ID format');
    }
    if (!candidateId || !/^[0-9a-fA-F]{24}$/.test(candidateId)) {
      throw new Error('Invalid candidate ID format');
    }

    const validatedReason = CandidateCancelBookingSchema.parse({ reason }).reason;

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await db.$transaction(
          async (tx) => {
            const booking = await tx.booking.findUnique({
              where: { id: bookingId },
              include: {
                session: true,
                candidate: {
                  select: { id: true, name: true, email: true },
                },
                mentor: {
                  select: { id: true, name: true, email: true },
                },
                service: {
                  select: { id: true, title: true },
                },
              },
            });

            if (!booking || booking.candidateId !== candidateId) {
              throw new Error('Booking not found or unauthorized');
            }

            // Check eligibility
            if (
              booking.status === 'CANCELLED_BY_CANDIDATE' ||
              booking.status === 'CANCELLED_BY_MENTOR'
            ) {
              const conflictErr: any = new Error('Booking has already been cancelled');
              conflictErr.statusCode = 409;
              throw conflictErr;
            }

            if (booking.status === 'COMPLETED') {
              const ineligibleErr: any = new Error('Completed sessions cannot be cancelled');
              ineligibleErr.statusCode = 400;
              throw ineligibleErr;
            }

            if (booking.status === 'NO_SHOW') {
              const ineligibleErr: any = new Error('Sessions marked as no-show cannot be cancelled');
              ineligibleErr.statusCode = 400;
              throw ineligibleErr;
            }

            if (new Date(booking.scheduledEnd).getTime() <= Date.now()) {
              const pastErr: any = new Error('Past sessions cannot be cancelled');
              pastErr.statusCode = 400;
              throw pastErr;
            }

            // Increment bookingVersion on mentor to serialize write transactions and release slots cleanly
            await tx.mentor.update({
              where: { id: booking.mentorId },
              data: { bookingVersion: { increment: 1 } },
            });

            // 1. Update Booking status to CANCELLED_BY_CANDIDATE
            const updated = await tx.booking.update({
              where: { id: bookingId },
              data: {
                status: 'CANCELLED_BY_CANDIDATE',
                cancellationReason: validatedReason || 'Cancelled by candidate',
                rescheduledStart: null,
                rescheduledEnd: null,
              },
              select: {
                id: true,
                mentorId: true,
                candidateId: true,
                scheduledStart: true,
                scheduledEnd: true,
                rescheduledStart: true,
                rescheduledEnd: true,
                timezone: true,
                status: true,
                studentNotes: true,
                cancellationReason: true,
                createdAt: true,
                mentor: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    headline: true,
                    company: true,
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
                    status: true,
                    meetingUrl: true,
                  },
                },
              },
            });

            // 2. Update linked session if it exists: mark CANCELLED and revoke meetingUrl
            if (booking.session) {
              await tx.mentorshipSession.update({
                where: { id: booking.session.id },
                data: {
                  status: 'CANCELLED',
                  meetingUrl: null,
                },
              });
            }

            return {
              booking: updated,
              candidateName: booking.candidate.name,
              candidateEmail: booking.candidate.email,
              mentorId: booking.mentorId,
              mentorName: booking.mentor?.name || '',
              mentorEmail: booking.mentor?.email || '',
              serviceId: booking.serviceId,
              serviceTitle: booking.service?.title || 'Mentorship Session',
              sessionStart: booking.scheduledStart,
              sessionEnd: booking.scheduledEnd,
              timezone: booking.timezone,
              reason: validatedReason || null,
            };
          },
          { maxWait: 5000, timeout: 10000 }
        );

        // Audit log in background
        AuditService.log({
          actorId: candidateId,
          actorEmail: result.candidateEmail,
          actorName: result.candidateName,
          action: 'BOOKING_CANCELLED_BY_CANDIDATE',
          resourceType: 'Booking',
          resourceId: bookingId,
          details: {
            mentorId: result.mentorId,
            serviceId: result.serviceId,
            reason: validatedReason || null,
          },
          ipAddress,
        }).catch(() => {});

        // Notify mentor of cancellation. Never rolls back the committed cancellation.
        try {
          await EmailService.sendMentorshipBookingCancelledByCandidateEmail({
            bookingId,
            studentName: result.candidateName,
            studentEmail: result.candidateEmail,
            mentorName: result.mentorName,
            mentorEmail: result.mentorEmail,
            serviceTitle: result.serviceTitle,
            sessionStart: result.sessionStart,
            sessionEnd: result.sessionEnd,
            cancellationReason: result.reason,
            timezone: result.timezone,
          });
        } catch (err: any) {
          console.error(`[BookingService] Failed to dispatch candidate cancellation email for ${bookingId}:`, err?.message || err);
        }

        return this.toCandidateDTO(result.booking);
      } catch (err: any) {
        const isWriteConflict =
          err.code === 'P2034' ||
          (err.message && (err.message.includes('WriteConflict') || err.message.includes('write conflict')));

        if (isWriteConflict && attempt < MAX_RETRIES) {
          const delay = 30 * Math.pow(1.5, attempt) + Math.random() * 50;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw err;
      }
    }

    throw new Error('Failed to cancel booking due to high contention. Please try again.');
  }

  /**
   * Candidate-initiated booking rescheduling request.
   * Enforces that only the owning candidate can request a reschedule for an eligible active booking.
   * Validates replacement slot against mentor availability, working hours, blackout exceptions, and duration.
   * Executes inside an atomic MongoDB replica-set transaction serialized on Mentor.bookingVersion.
   * Atomically transitions the booking status to RESCHEDULE_REQUESTED with replacement start and end times,
   * updates the linked MentorshipSession (clearing meetingUrl until confirmed by mentor),
   * releases the previous slot, occupies the replacement slot, and records an audit log.
   */
  static async rescheduleBookingByCandidate(
    bookingId: string,
    candidateId: string,
    data: z.input<typeof CandidateRescheduleBookingSchema>,
    ipAddress?: string | null
  ): Promise<CandidateBookingDTO> {
    if (!bookingId || !/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      const err: any = new Error('Invalid booking ID format');
      err.statusCode = 400;
      throw err;
    }
    if (!candidateId || !/^[0-9a-fA-F]{24}$/.test(candidateId)) {
      const err: any = new Error('Invalid candidate ID format');
      err.statusCode = 400;
      throw err;
    }

    const validated = CandidateRescheduleBookingSchema.parse(data);
    const replacementStart = new Date(validated.scheduledStart);
    if (isNaN(replacementStart.getTime())) {
      const err: any = new Error('Invalid replacement scheduled start time');
      err.statusCode = 400;
      throw err;
    }
    if (replacementStart.getTime() <= Date.now()) {
      const err: any = new Error('Replacement slot must be scheduled in the future');
      err.statusCode = 400;
      throw err;
    }

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await db.$transaction(
          async (tx) => {
            // 1. Fetch current booking record inside transaction
            const booking = await tx.booking.findUnique({
              where: { id: bookingId },
              include: {
                candidate: {
                  select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
                },
                mentor: {
                  select: { id: true, name: true, email: true, avatar: true, headline: true, company: true, status: true },
                },
                service: true,
                session: true,
              },
            });

            if (!booking) {
              const err: any = new Error('Booking not found');
              err.statusCode = 404;
              throw err;
            }

            // 2. IDOR protection: Verify authenticated candidate ownership
            if (booking.candidateId !== candidateId) {
              const err: any = new Error('Unauthorized access to booking');
              err.statusCode = 403;
              throw err;
            }

            // 3. Status eligibility checks
            if (
              booking.status === 'CANCELLED_BY_CANDIDATE' ||
              booking.status === 'CANCELLED_BY_MENTOR' ||
              booking.status === 'RESCHEDULED'
            ) {
              const err: any = new Error('This booking has been cancelled and cannot be rescheduled');
              err.statusCode = 409;
              throw err;
            }

            if (booking.status === 'COMPLETED') {
              const err: any = new Error('Completed sessions cannot be rescheduled');
              err.statusCode = 400;
              throw err;
            }

            if (booking.status === 'NO_SHOW') {
              const err: any = new Error('Sessions marked as no-show cannot be rescheduled');
              err.statusCode = 400;
              throw err;
            }

            if (new Date(booking.scheduledEnd).getTime() <= Date.now()) {
              const err: any = new Error('Past sessions cannot be rescheduled');
              err.statusCode = 400;
              throw err;
            }

            // Check if slot is identical to current booking
            if (new Date(booking.scheduledStart).getTime() === replacementStart.getTime()) {
              const err: any = new Error('Replacement slot must be different from the currently scheduled time');
              err.statusCode = 400;
              throw err;
            }

            // 4. Calculate replacement end time using the same mentorship service duration
            const replacementEnd = new Date(
              replacementStart.getTime() + booking.service.duration * 60 * 1000
            );

            // 5. Serialize transaction on Mentor.bookingVersion
            await tx.mentor.update({
              where: { id: booking.mentorId },
              data: { bookingVersion: { increment: 1 } },
            });

            // 6. Validate mentor availability rules & exceptions for replacement slot
            await AvailabilityService.validateSlotAvailability(
              booking.mentorId,
              replacementStart,
              replacementEnd
            );

            // 7. Check for colliding active bookings occupying the replacement slot
            const collision = await tx.booking.findFirst({
              where: {
                mentorId: booking.mentorId,
                status: { in: ['CONFIRMED', 'PENDING', 'RESCHEDULE_REQUESTED'] },
                id: { not: booking.id }, // Ignore current booking
                OR: [
                  {
                    scheduledStart: { lt: replacementEnd },
                    scheduledEnd: { gt: replacementStart },
                  },
                  {
                    status: 'RESCHEDULE_REQUESTED',
                    rescheduledStart: { not: null, lt: replacementEnd },
                    rescheduledEnd: { not: null, gt: replacementStart },
                  },
                ],
              },
            });

            if (collision) {
              const err: any = new Error(
                'The requested replacement slot was just reserved by another candidate. Please select another slot.'
              );
              err.statusCode = 409;
              throw err;
            }

            // 8. Atomically update the booking to RESCHEDULE_REQUESTED holding the replacement slot.
            // CRITICAL: scheduledStart and scheduledEnd preserve the original confirmed schedule!
            const updated = await tx.booking.update({
              where: { id: booking.id },
              data: {
                rescheduledStart: replacementStart,
                rescheduledEnd: replacementEnd,
                timezone: validated.timezone || booking.timezone,
                status: 'RESCHEDULE_REQUESTED',
                studentNotes:
                  validated.studentNotes !== undefined ? validated.studentNotes : booking.studentNotes,
                cancellationReason: null,
              },
              include: {
                candidate: {
                  select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
                },
                mentor: {
                  select: { id: true, name: true, email: true, avatar: true, headline: true, company: true },
                },
                service: true,
                session: true,
              },
            });

            // 9. Sync linked session: reset meetingUrl until mentor confirms rescheduled slot
            if (booking.session) {
              await tx.mentorshipSession.update({
                where: { id: booking.session.id },
                data: {
                  status: 'SCHEDULED',
                  meetingUrl: null,
                },
              });
            }

            return {
              booking: updated,
              candidateName: booking.candidate.name,
              candidateEmail: booking.candidate.email,
              mentorId: booking.mentorId,
              mentorName: booking.mentor.name,
              mentorEmail: booking.mentor.email,
              serviceId: booking.serviceId,
              serviceTitle: booking.service.title,
              previousStart: booking.scheduledStart,
              previousEnd: booking.scheduledEnd,
              newStart: replacementStart,
              newEnd: replacementEnd,
              studentNotes: validated.studentNotes !== undefined ? validated.studentNotes : booking.studentNotes,
              timezone: validated.timezone || booking.timezone,
            };
          },
          { maxWait: 15000, timeout: 30000 }
        );

        // Audit log in background
        AuditService.log({
          actorId: candidateId,
          actorEmail: result.candidateEmail,
          actorName: result.candidateName,
          action: 'BOOKING_RESCHEDULE_REQUESTED',
          resourceType: 'Booking',
          resourceId: bookingId,
          details: {
            mentorId: result.mentorId,
            serviceId: result.serviceId,
            previousStart: result.previousStart instanceof Date ? result.previousStart.toISOString() : result.previousStart,
            newStart: result.newStart.toISOString(),
            notes: validated.studentNotes || null,
          },
          ipAddress,
        }).catch(() => {});

        // Notify mentor of reschedule request awaiting approval.
        // Delivery failures are caught and logged, never rolling back the committed reschedule request.
        try {
          await EmailService.sendMentorshipRescheduleRequestedEmail({
            bookingId,
            mentorName: result.mentorName,
            mentorEmail: result.mentorEmail,
            studentName: result.candidateName,
            studentEmail: result.candidateEmail,
            serviceTitle: result.serviceTitle,
            originalStart: result.previousStart,
            originalEnd: result.previousEnd,
            proposedStart: result.newStart,
            proposedEnd: result.newEnd,
            studentNotes: result.studentNotes,
            timezone: result.timezone,
          });
        } catch (err: any) {
          console.error(`[BookingService] Failed to dispatch reschedule requested email for ${bookingId}:`, err?.message || err);
        }

        return this.toCandidateDTO(result.booking);
      } catch (err: any) {
        const isReplicaSetMissing =
          (err.code === 'P2028' && (err.message?.includes('replica set') || err.message?.includes('mongos') || err.message?.includes('requires a replica set'))) ||
          (err.message && err.message.includes('requires a replica set'));

        if (isReplicaSetMissing) {
          console.error(
            '[BookingService] MongoDB replica set transaction support is required for concurrency-safe rescheduling.',
            err
          );
          throw new Error(
            'Mentorship booking service is unavailable: database transactions are not supported by the current database configuration. A MongoDB replica set is required.'
          );
        }

        const isWriteConflict =
          err.code === 'P2034' ||
          err.code === 'P2028' ||
          (err.message &&
            (err.message.includes('WriteConflict') ||
              err.message.includes('write conflict') ||
              err.message.includes('Transaction already closed') ||
              err.message.includes('expired transaction')));

        if (isWriteConflict && attempt < MAX_RETRIES) {
          const delay = 40 * Math.pow(1.5, attempt) + Math.random() * 100;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw err;
      }
    }

    const err: any = new Error('Failed to reschedule booking due to high contention. Please try again.');
    err.statusCode = 409;
    throw err;
  }

  private static toCandidateDTO(b: any): CandidateBookingDTO {
    const isCancelled =
      b.status === 'CANCELLED_BY_CANDIDATE' ||
      b.status === 'CANCELLED_BY_MENTOR' ||
      b.status === 'RESCHEDULED';
    const isCompleted = b.status === 'COMPLETED';
    const isNoShow = b.status === 'NO_SHOW';
    const isPast = new Date(b.scheduledEnd).getTime() <= Date.now();

    const canCancel = !isCancelled && !isCompleted && !isNoShow && !isPast;
    const canReschedule = (b.status === 'CONFIRMED' || b.status === 'PENDING') && !isPast;

    const shouldExposeMeeting =
      b.status === 'CONFIRMED' &&
      b.session?.status !== 'CANCELLED' &&
      !isPast;

    return {
      id: b.id,
      mentorId: b.mentorId,
      mentor: {
        id: b.mentor?.id || b.mentorId,
        name: b.mentor?.name || 'Mentor',
        avatar:
          b.mentor?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        headline: b.mentor?.headline || 'Expert Mentor',
        company: b.mentor?.company || null,
      },
      service: {
        id: b.service?.id || '',
        title: b.service?.title || 'Mentorship Session',
        category: (b.service?.category as MentorshipCategory) || 'CAREER_DIRECTION',
        duration: b.service?.duration || 45,
        price: b.service?.price ?? 0,
        currency: b.service?.currency || 'INR',
      },
      scheduledStart:
        b.scheduledStart instanceof Date ? b.scheduledStart.toISOString() : b.scheduledStart,
      scheduledEnd:
        b.scheduledEnd instanceof Date ? b.scheduledEnd.toISOString() : b.scheduledEnd,
      rescheduledStart: b.rescheduledStart
        ? (b.rescheduledStart instanceof Date ? b.rescheduledStart.toISOString() : b.rescheduledStart)
        : null,
      rescheduledEnd: b.rescheduledEnd
        ? (b.rescheduledEnd instanceof Date ? b.rescheduledEnd.toISOString() : b.rescheduledEnd)
        : null,
      timezone: b.timezone || 'Asia/Kolkata',
      status: b.status as BookingStatus,
      studentNotes: b.studentNotes || null,
      cancellationReason: b.cancellationReason || null,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      hasSession: !!b.session,
      sessionId: b.session?.id || null,
      sessionStatus: b.session?.status || null,
      meetingUrl: shouldExposeMeeting ? b.session?.meetingUrl || null : null,
      canCancel,
      canReschedule,
    };
  }
}
