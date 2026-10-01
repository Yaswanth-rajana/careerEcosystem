import { db } from '../../db/client';
import { MentorStudentDTO, MentorshipCategory, PaginatedResult } from '../../types/mentorship';

export interface StudentListItemDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  headline?: string | null;
  candidateType?: string | null;
  totalSessions: number;
  lastSessionDate?: string | null;
  status: 'ACTIVE' | 'COMPLETED';
}

export class MentorStudentService {
  /**
   * Lists distinct students who have booked mentorship sessions with this mentor.
   * Requirement 20: Only actual mentees, not every platform user.
   */
  static async listStudents(params: {
    mentorId: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<StudentListItemDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    // Find all bookings for this mentor
    const mentorBookings = await db.booking.findMany({
      where: { mentorId: params.mentorId },
      select: {
        candidateId: true,
        scheduledStart: true,
        status: true,
      },
      orderBy: { scheduledStart: 'desc' },
    });

    // Group bookings by candidateId
    const candidateMap = new Map<string, { totalSessions: number; lastSessionDate: Date; hasUpcoming: boolean }>();
    for (const b of mentorBookings) {
      const entry = candidateMap.get(b.candidateId);
      if (!entry) {
        candidateMap.set(b.candidateId, {
          totalSessions: 1,
          lastSessionDate: b.scheduledStart,
          hasUpcoming: b.status === 'CONFIRMED' && b.scheduledStart >= new Date(),
        });
      } else {
        entry.totalSessions += 1;
        if (b.scheduledStart > entry.lastSessionDate) {
          entry.lastSessionDate = b.scheduledStart;
        }
        if (b.status === 'CONFIRMED' && b.scheduledStart >= new Date()) {
          entry.hasUpcoming = true;
        }
      }
    }

    const candidateIds = Array.from(candidateMap.keys());
    if (candidateIds.length === 0) {
      return { items: [], total: 0, page: 1, limit, totalPages: 1 };
    }

    const whereUser: any = {
      id: { in: candidateIds },
    };

    if (params.search?.trim()) {
      const q = params.search.trim();
      whereUser.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      db.user.count({ where: whereUser }),
      db.user.findMany({
        where: whereUser,
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
        skip,
        take: limit,
      }),
    ]);

    const items: StudentListItemDTO[] = users.map((u) => {
      const stats = candidateMap.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        headline: u.profile?.headline || null,
        candidateType: u.profile?.candidateType || null,
        totalSessions: stats?.totalSessions || 0,
        lastSessionDate: stats?.lastSessionDate ? stats.lastSessionDate.toISOString() : null,
        status: stats?.hasUpcoming ? 'ACTIVE' : 'COMPLETED',
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves full authorized context for a specific mentee.
   * Requirement 19, 21: Dedicated MentorStudentDTO, zero sensitive auth data leak.
   */
  static async getStudentDetail(studentId: string, mentorId: string): Promise<MentorStudentDTO | null> {
    // 1. Verify that this mentor has actually had bookings with this student
    const bookings = await db.booking.findMany({
      where: {
        mentorId,
        candidateId: studentId,
      },
      include: {
        service: true,
        session: true,
      },
      orderBy: { scheduledStart: 'desc' },
    });

    if (bookings.length === 0) {
      throw new Error('Forbidden. You do not have an active mentorship relationship with this candidate.');
    }

    const user = await db.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        profile: {
          select: {
            headline: true,
            candidateType: true,
            location: true,
            totalExperience: true,
            careerGoal: {
              select: {
                targetRole: true,
                careerField: true,
                timeframe: true,
                notes: true,
              },
            },
            userSkills: {
              select: {
                level: true,
                skill: { select: { name: true } },
              },
              take: 15,
            },
            projects: {
              select: {
                title: true,
                description: true,
                role: true,
                technologies: true,
              },
              take: 5,
            },
          },
        },
      },
    });

    if (!user) return null;

    const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
    const history = bookings.map((b) => {
      let actionItems = [];
      if (b.session?.actionItems) {
        try {
          actionItems = JSON.parse(b.session.actionItems);
        } catch {
          actionItems = [];
        }
      }

      return {
        bookingId: b.id,
        sessionId: b.session?.id || null,
        serviceTitle: b.service.title,
        serviceCategory: b.service.category as MentorshipCategory,
        scheduledStart: b.scheduledStart.toISOString(),
        status: b.status as any,
        notes: b.session?.notes || null,
        actionItems,
      };
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      headline: user.profile?.headline || null,
      candidateType: user.profile?.candidateType || null,
      location: user.profile?.location || null,
      careerGoal: user.profile?.careerGoal ? {
        targetRole: user.profile.careerGoal.targetRole,
        careerField: user.profile.careerGoal.careerField || undefined,
        timeframe: user.profile.careerGoal.timeframe || undefined,
        notes: user.profile.careerGoal.notes || undefined,
      } : null,
      skills: user.profile?.userSkills?.map((us) => ({
        name: us.skill.name,
        level: us.level,
      })) || [],
      experienceSummary: user.profile?.totalExperience || null,
      recentProjects: user.profile?.projects || [],
      mentorshipStats: {
        totalSessions: bookings.length,
        completedSessions: completedCount,
        lastSessionDate: bookings[0]?.scheduledStart ? bookings[0].scheduledStart.toISOString() : null,
        firstSessionDate: bookings[bookings.length - 1]?.scheduledStart
          ? bookings[bookings.length - 1].scheduledStart.toISOString()
          : new Date().toISOString(),
      },
      history,
    };
  }
}
