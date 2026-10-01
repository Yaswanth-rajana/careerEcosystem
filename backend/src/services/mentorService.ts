import { db } from '../db/client';
import {
  MentorListDTO,
  MentorDetailDTO,
  PaginatedAdminResult,
  MentorStatus,
} from '../types/admin';
import { AuditService } from './auditService';
import { AuthenticatedAdmin } from './adminAuthService';

export interface ListMentorsParams {
  page?: number;
  limit?: number;
  q?: string;
  domain?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class MentorService {
  /**
   * Retrieves paginated mentors for administrative list table.
   */
  static async listMentors(params: ListMentorsParams = {}): Promise<PaginatedAdminResult<MentorListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.domain && params.domain !== 'All') {
      where.domain = { equals: params.domain, mode: 'insensitive' };
    }
    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, mentors] = await Promise.all([
      db.mentor.count({ where }),
      db.mentor.findMany({
        where,
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          headline: true,
          domain: true,
          experienceYears: true,
          rating: true,
          reviewCount: true,
          sessionCount: true,
          startingPrice: true,
          status: true,
          createdAt: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const items: MentorListDTO[] = mentors.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.name,
      email: m.email,
      headline: m.headline,
      domain: m.domain,
      experienceYears: m.experienceYears,
      rating: m.rating,
      reviewCount: m.reviewCount,
      sessionCount: m.sessionCount,
      startingPrice: m.startingPrice,
      status: m.status as MentorStatus,
      createdAt: m.createdAt.toISOString(),
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
   * Retrieves full mentor details including application metadata.
   */
  static async getMentorDetail(mentorId: string): Promise<MentorDetailDTO | null> {
    if (!mentorId) return null;

    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) return null;

    return {
      id: mentor.id,
      userId: mentor.userId,
      name: mentor.name,
      email: mentor.email,
      headline: mentor.headline,
      domain: mentor.domain,
      company: mentor.company,
      avatar: mentor.avatar,
      experienceYears: mentor.experienceYears,
      rating: mentor.rating,
      reviewCount: mentor.reviewCount,
      sessionCount: mentor.sessionCount,
      startingPrice: mentor.startingPrice,
      status: mentor.status as MentorStatus,
      bio: mentor.bio,
      expertise: mentor.expertise,
      sessionTypes: mentor.sessionTypes,
      skillsList: mentor.skillsList,
      rejectionReason: mentor.rejectionReason,
      approvedAt: mentor.approvedAt?.toISOString() || null,
      createdAt: mentor.createdAt.toISOString(),
      updatedAt: mentor.updatedAt.toISOString(),
    };
  }

  /**
   * Approves a mentor application.
   * Requirement 23: Auditable approval action with actor, target, timestamp.
   * Also elevates the corresponding User role to MENTOR if user exists.
   */
  static async approveMentor(mentorId: string, actor: AuthenticatedAdmin, note?: string): Promise<MentorDetailDTO> {
    const mentor = await db.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      throw new Error(`Mentor with ID ${mentorId} not found`);
    }

    const updated = await db.mentor.update({
      where: { id: mentorId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Elevate user role if registered
    if (mentor.email) {
      await db.user.updateMany({
        where: { email: mentor.email.toLowerCase() },
        data: { role: 'MENTOR' },
      }).catch(() => {});
    }

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'MENTOR_APPROVED',
      resourceType: 'MENTOR',
      resourceId: mentorId,
      details: { mentorName: mentor.name, mentorEmail: mentor.email, note },
    });

    return (await this.getMentorDetail(mentorId))!;
  }

  /**
   * Rejects a mentor application with mandatory reason.
   */
  static async rejectMentor(mentorId: string, reason: string, actor: AuthenticatedAdmin): Promise<MentorDetailDTO> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed reason (at least 5 characters) is required when rejecting a mentor.');
    }

    const mentor = await db.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      throw new Error(`Mentor with ID ${mentorId} not found`);
    }

    await db.mentor.update({
      where: { id: mentorId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'MENTOR_REJECTED',
      resourceType: 'MENTOR',
      resourceId: mentorId,
      details: { mentorName: mentor.name, mentorEmail: mentor.email, reason: reason.trim() },
    });

    return (await this.getMentorDetail(mentorId))!;
  }

  /**
   * Suspends an active mentor.
   */
  static async suspendMentor(mentorId: string, reason: string, actor: AuthenticatedAdmin): Promise<MentorDetailDTO> {
    const mentor = await db.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      throw new Error(`Mentor with ID ${mentorId} not found`);
    }

    await db.mentor.update({
      where: { id: mentorId },
      data: {
        status: 'SUSPENDED',
        rejectionReason: reason || 'Suspended by platform administrator',
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'MENTOR_SUSPENDED',
      resourceType: 'MENTOR',
      resourceId: mentorId,
      details: { mentorName: mentor.name, reason },
    });

    return (await this.getMentorDetail(mentorId))!;
  }

  /**
   * Reactivates a suspended mentor.
   */
  static async reactivateMentor(mentorId: string, actor: AuthenticatedAdmin): Promise<MentorDetailDTO> {
    const mentor = await db.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      throw new Error(`Mentor with ID ${mentorId} not found`);
    }

    await db.mentor.update({
      where: { id: mentorId },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'MENTOR_REACTIVATED',
      resourceType: 'MENTOR',
      resourceId: mentorId,
      details: { mentorName: mentor.name },
    });

    return (await this.getMentorDetail(mentorId))!;
  }
}
