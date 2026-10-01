import { db } from '../../db/client';
import {
  MentorDashboardDTO,
  BookingListDTO,
  MentorshipCategory,
  BookingStatus,
} from '../../types/mentorship';
import { MentorProfileService } from './mentorProfileService';
import { MentorshipServiceManager } from './mentorshipService';
import { AvailabilityService } from './availabilityService';

export class MentorDashboardService {
  /**
   * Generates lean, aggregated dashboard data for the authenticated mentor.
   * Requirement 27 & 29: Limit payloads, avoid N+1 queries, project only needed fields.
   */
  static async getDashboard(mentorId: string): Promise<MentorDashboardDTO> {
    const profile = await MentorProfileService.getProfile(mentorId);
    if (!profile) {
      throw new Error('Mentor profile not found');
    }

    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Parallel fetch with limits
    const [
      todaySessionsRaw,
      upcomingBookingsRaw,
      pendingRequestsRaw,
      services,
      availabilitySummary,
      activeMenteesCount,
      completedMentorshipsCount,
      recentBookings,
    ] = await Promise.all([
      // 1. Today's sessions (limit 5)
      db.booking.findMany({
        where: {
          mentorId,
          scheduledStart: { gte: startOfToday, lte: endOfToday },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        select: this.bookingSelect(),
        orderBy: { scheduledStart: 'asc' },
        take: 5,
      }),

      // 2. Upcoming bookings after today (limit 5)
      db.booking.findMany({
        where: {
          mentorId,
          scheduledStart: { gt: endOfToday },
          status: 'CONFIRMED',
        },
        select: this.bookingSelect(),
        orderBy: { scheduledStart: 'asc' },
        take: 5,
      }),

      // 3. Pending requests needing mentor action (limit 5)
      db.booking.findMany({
        where: {
          mentorId,
          status: { in: ['PENDING', 'RESCHEDULE_REQUESTED'] },
        },
        select: this.bookingSelect(),
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // 4. Services preview (all active, max 4)
      MentorshipServiceManager.listServicesByMentor(mentorId, true),

      // 5. Availability summary
      AvailabilityService.getAvailabilitySummary(mentorId),

      // 6. Distinct active mentees count
      db.booking.groupBy({
        by: ['candidateId'],
        where: { mentorId },
      }).then((groups) => groups.length),

      // 7. Completed mentorships count
      db.booking.count({
        where: { mentorId, status: 'COMPLETED' },
      }),

      // 8. Recent activity (limit 10)
      db.booking.findMany({
        where: { mentorId },
        select: {
          id: true,
          status: true,
          scheduledStart: true,
          createdAt: true,
          candidate: { select: { name: true } },
          service: { select: { title: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    const mapBooking = (b: any): BookingListDTO => ({
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
    });

    const recentActivity = recentBookings.map((b) => {
      let type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'SESSION_COMPLETED' | 'REVIEW_RECEIVED' = 'BOOKING_CREATED';
      let title = `Booking requested by ${b.candidate.name}`;
      let description = `${b.service.title}`;

      if (b.status === 'CONFIRMED') {
        type = 'BOOKING_CONFIRMED';
        title = `Session confirmed with ${b.candidate.name}`;
      } else if (b.status === 'COMPLETED') {
        type = 'SESSION_COMPLETED';
        title = `Completed session with ${b.candidate.name}`;
      }

      return {
        id: b.id,
        type,
        title,
        description,
        timestamp: b.createdAt.toISOString(),
      };
    });

    return {
      mentor: profile,
      summary: {
        todaySessionCount: todaySessionsRaw.length,
        upcomingBookingsCount: upcomingBookingsRaw.length,
        pendingRequestsCount: pendingRequestsRaw.length,
        activeMenteesCount,
        completedMentorshipsCount,
        averageRating: profile.rating,
        totalReviews: profile.reviewCount,
      },
      todaySessions: todaySessionsRaw.map(mapBooking),
      upcomingBookings: upcomingBookingsRaw.map(mapBooking),
      pendingRequests: pendingRequestsRaw.map(mapBooking),
      servicesPreview: services.slice(0, 4),
      availabilitySummary,
      recentActivity,
    };
  }

  private static bookingSelect() {
    return {
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
    };
  }
}
