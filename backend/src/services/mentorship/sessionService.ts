import { db } from '../../db/client';
import {
  SessionDTO,
  MentorshipCategory,
  ActionItemDTO,
} from '../../types/mentorship';
import { UpdateSessionNotesSchema } from '../../validations/mentorshipSchemas';
import { z } from 'zod';

export interface SessionDetailViewDTO {
  session: SessionDTO;
  booking: {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
    timezone: string;
    status: string;
    studentNotes?: string | null;
  };
  service: {
    id: string;
    title: string;
    category: MentorshipCategory;
    duration: number;
  };
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    headline?: string | null;
    candidateType?: string | null;
    location?: string | null;
    careerGoal?: {
      targetRole?: string;
      careerField?: string;
      timeframe?: string;
    } | null;
    skills: string[];
    bio?: string | null;
  };
  previousSessions: Array<{
    id: string;
    bookingId: string;
    serviceTitle: string;
    scheduledStart: string;
    status: string;
  }>;
}

export class SessionService {
  /**
   * Retrieves full session workspace data for the mentor.
   * Requirement 18: Student context, target role, skills, goal, previous sessions, notes, action items.
   */
  static async getSessionDetail(sessionId: string, mentorId: string): Promise<SessionDetailViewDTO | null> {
    const session = await db.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            service: true,
          },
        },
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
                location: true,
                bio: true,
                careerGoal: {
                  select: {
                    targetRole: true,
                    careerField: true,
                    timeframe: true,
                  },
                },
                userSkills: {
                  select: {
                    skill: {
                      select: { name: true },
                    },
                  },
                  take: 10,
                },
              },
            },
          },
        },
      },
    });

    if (!session) return null;
    if (session.mentorId !== mentorId) {
      throw new Error('Unauthorized access to session');
    }

    // Fetch previous sessions between this mentor and student
    const previous = await db.mentorshipSession.findMany({
      where: {
        mentorId,
        candidateId: session.candidateId,
        id: { not: sessionId },
      },
      include: {
        booking: {
          include: {
            service: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    let actionItems: ActionItemDTO[] = [];
    if (session.actionItems) {
      try {
        actionItems = JSON.parse(session.actionItems);
      } catch {
        actionItems = [];
      }
    }

    const skills = session.candidate.profile?.userSkills?.map((s) => s.skill.name) || [];

    return {
      session: {
        id: session.id,
        bookingId: session.bookingId,
        mentorId: session.mentorId,
        candidateId: session.candidateId,
        startedAt: session.startedAt?.toISOString() || null,
        endedAt: session.endedAt?.toISOString() || null,
        meetingUrl: session.meetingUrl,
        notes: session.notes,
        actionItems,
        status: session.status as any,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      },
      booking: {
        id: session.booking.id,
        scheduledStart: session.booking.scheduledStart.toISOString(),
        scheduledEnd: session.booking.scheduledEnd.toISOString(),
        timezone: session.booking.timezone,
        status: session.booking.status,
        studentNotes: session.booking.studentNotes,
      },
      service: {
        id: session.booking.service.id,
        title: session.booking.service.title,
        category: session.booking.service.category as MentorshipCategory,
        duration: session.booking.service.duration,
      },
      student: {
        id: session.candidate.id,
        name: session.candidate.name,
        email: session.candidate.email,
        avatarUrl: session.candidate.avatarUrl,
        headline: session.candidate.profile?.headline || null,
        candidateType: session.candidate.profile?.candidateType || null,
        location: session.candidate.profile?.location || null,
        bio: session.candidate.profile?.bio || null,
        careerGoal: session.candidate.profile?.careerGoal ? {
          targetRole: session.candidate.profile.careerGoal.targetRole,
          careerField: session.candidate.profile.careerGoal.careerField || undefined,
          timeframe: session.candidate.profile.careerGoal.timeframe || undefined,
        } : null,
        skills,
      },
      previousSessions: previous.map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        serviceTitle: p.booking.service.title,
        scheduledStart: p.booking.scheduledStart.toISOString(),
        status: p.status,
      })),
    };
  }

  /**
   * Updates session notes and action items.
   */
  static async updateSessionNotes(
    sessionId: string,
    mentorId: string,
    data: z.infer<typeof UpdateSessionNotesSchema>
  ): Promise<SessionDTO> {
    const validated = UpdateSessionNotesSchema.parse(data);

    const existing = await db.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!existing || existing.mentorId !== mentorId) {
      throw new Error('Session not found or unauthorized');
    }

    const updateData: any = {};
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.actionItems !== undefined) {
      updateData.actionItems = JSON.stringify(validated.actionItems);
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
      if (validated.status === 'IN_PROGRESS' && !existing.startedAt) {
        updateData.startedAt = new Date();
      } else if (validated.status === 'COMPLETED' && !existing.endedAt) {
        updateData.endedAt = new Date();
      }
    }
    if (validated.meetingUrl !== undefined) {
      updateData.meetingUrl = validated.meetingUrl;
    }

    const updated = await db.mentorshipSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    let actionItems: ActionItemDTO[] = [];
    if (updated.actionItems) {
      try {
        actionItems = JSON.parse(updated.actionItems);
      } catch {
        actionItems = [];
      }
    }

    return {
      id: updated.id,
      bookingId: updated.bookingId,
      mentorId: updated.mentorId,
      candidateId: updated.candidateId,
      startedAt: updated.startedAt?.toISOString() || null,
      endedAt: updated.endedAt?.toISOString() || null,
      meetingUrl: updated.meetingUrl,
      notes: updated.notes,
      actionItems,
      status: updated.status as any,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
