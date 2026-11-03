import { db } from '../../db/client';
import {
  RecruiterInterviewDTO,
  AuthenticatedRecruiter,
  InterviewFeedbackSubmitDTO,
} from '../../types/recruiter';
import {
  RecruiterInterviewCreateSchema,
  RecruiterInterviewUpdateSchema,
  InterviewFeedbackSchema,
  InterviewAssignSchema,
} from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { EmailService } from '../email/emailService';
import { RecruiterRbacService } from './recruiterRbacService';
import { RecruiterAuthError } from './recruiterAuthService';
import { z } from 'zod';

export class RecruiterInterviewService {
  /**
   * Retrieves interviews strictly for the recruiter's company, enforcing role-based visibility.
   */
  static async listInterviews(
    companyId: string,
    filter?: 'upcoming' | 'today' | 'completed' | 'all',
    auth?: AuthenticatedRecruiter
  ): Promise<RecruiterInterviewDTO[]> {
    if (auth) {
      RecruiterRbacService.assertActiveMembership(auth);
    }

    const where: any = { companyId };
    const now = new Date();

    if (filter === 'upcoming') {
      where.scheduledAt = { gte: now };
      where.status = 'SCHEDULED';
    } else if (filter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledAt = { gte: startOfDay, lte: endOfDay };
    } else if (filter === 'completed') {
      where.status = 'COMPLETED';
    }

    // Role-based visibility scoping
    if (auth) {
      if (
        auth.companyRole === 'TECHNICAL_INTERVIEWER' ||
        auth.companyRole === 'HR_INTERVIEWER'
      ) {
        where.OR = [
          { interviewerId: auth.user.id },
          { interviewerName: auth.user.name },
        ];
      } else if (
        auth.companyRole === 'HIRING_MANAGER' &&
        auth.membership.assignedJobIds.length > 0
      ) {
        where.jobId = { in: auth.membership.assignedJobIds };
      }
    }

    const interviews = await db.interview.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        candidate: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    const items: RecruiterInterviewDTO[] = interviews.map((inv) => ({
      id: inv.id,
      companyId: inv.companyId,
      jobId: inv.jobId,
      jobTitle: inv.job.title,
      applicationId: inv.applicationId,
      candidateId: inv.candidateId,
      candidateName: inv.candidate.name,
      candidateEmail: inv.candidate.email,
      candidateAvatar: inv.candidate.avatarUrl,
      interviewerId: inv.interviewerId,
      interviewerName: inv.interviewerName,
      title: inv.title,
      type: inv.type,
      scheduledAt: inv.scheduledAt.toISOString(),
      durationMinutes: inv.durationMinutes,
      meetingUrl: inv.meetingUrl,
      notes: inv.notes,
      feedback: inv.feedback,
      rating: inv.rating,
      recommendation: inv.recommendation,
      feedbackSubmittedAt: inv.feedbackSubmittedAt
        ? inv.feedbackSubmittedAt.toISOString()
        : null,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    }));

    return items;
  }

  /**
   * Retrieves single interview detail with company isolation and RBAC assignment checks.
   */
  static async getInterviewById(
    interviewId: string,
    companyId: string,
    auth?: AuthenticatedRecruiter
  ): Promise<RecruiterInterviewDTO> {
    if (auth) {
      RecruiterRbacService.assertActiveMembership(auth);
      await RecruiterRbacService.assertInterviewAccess(auth, interviewId);
    }

    const inv = await db.interview.findFirst({
      where: {
        id: interviewId,
        companyId,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!inv) {
      throw new RecruiterAuthError('Interview not found or access denied.', 404);
    }

    return {
      id: inv.id,
      companyId: inv.companyId,
      candidateId: inv.candidateId,
      candidateName: inv.candidate?.name || 'Unknown Candidate',
      candidateEmail: inv.candidate?.email || '',
      jobId: inv.jobId,
      jobTitle: inv.job?.title || 'Unknown Job',
      applicationId: inv.applicationId,
      type: inv.type,
      title: inv.title,
      scheduledAt: inv.scheduledAt.toISOString(),
      durationMinutes: inv.durationMinutes,
      meetingUrl: inv.meetingUrl || null,
      interviewerId: inv.interviewerId || null,
      interviewerName: inv.interviewer?.name || null,
      interviewerEmail: inv.interviewer?.email || null,
      feedback: inv.feedback || null,
      rating: inv.rating ?? null,
      recommendation: inv.recommendation || null,
      feedbackSubmittedAt: inv.feedbackSubmittedAt
        ? inv.feedbackSubmittedAt.toISOString()
        : null,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    };
  }

  /**
   * Schedules a new interview for a candidate application.
   */
  static async scheduleInterview(
    data: z.infer<typeof RecruiterInterviewCreateSchema> & { interviewerId?: string },
    auth: AuthenticatedRecruiter
  ) {
    RecruiterRbacService.assertPermission(auth, 'interviews:schedule');

    const validated = RecruiterInterviewCreateSchema.parse(data);

    // Verify job belongs to company
    const job = await RecruiterRbacService.assertJobAccess(auth, validated.jobId);

    // Verify application belongs to company job
    const app = await RecruiterRbacService.assertApplicationAccess(auth, validated.applicationId);

    // If interviewerId provided, resolve assigned member
    let interviewerId: string | null = (data as any).interviewerId || null;
    let interviewerName = validated.interviewerName || auth.user.name;

    if (interviewerId) {
      const assignedMember = await db.companyMember.findFirst({
        where: { userId: interviewerId, companyId: auth.company.id },
        include: { user: true },
      });
      if (assignedMember) {
        interviewerName = assignedMember.user.name;
      }
    }

    const interview = await db.interview.create({
      data: {
        companyId: auth.company.id,
        jobId: validated.jobId,
        applicationId: validated.applicationId,
        candidateId: validated.candidateId,
        interviewerId,
        title: validated.title,
        type: validated.type,
        scheduledAt: new Date(validated.scheduledAt),
        durationMinutes: validated.durationMinutes,
        meetingUrl: validated.meetingUrl || null,
        interviewerName,
        notes: validated.notes || null,
        status: 'SCHEDULED',
      },
      include: {
        candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
    });

    // Automatically transition application status to INTERVIEW if applicable
    await db.jobApplication
      .update({
        where: { id: validated.applicationId },
        data: { status: 'INTERVIEW', reviewedAt: new Date() },
      })
      .catch(() => {});

    // Notify assigned interviewer if an interviewer is assigned
    if (interviewerId) {
      const assignedUser = await db.user.findUnique({ where: { id: interviewerId } });
      if (assignedUser) {
        EmailService.sendInterviewerAssignmentNotificationEmail({
          interviewerEmail: assignedUser.email,
          interviewerName: assignedUser.name,
          candidateName: interview.candidate.name,
          jobTitle: job.title,
          interviewType: interview.type,
          scheduledAt: interview.scheduledAt.toISOString(),
          durationMinutes: interview.durationMinutes,
          meetingUrl: interview.meetingUrl,
          companyName: auth.company.name,
        }).catch(() => {});
      }
    }

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INTERVIEW_SCHEDULED',
      resourceType: 'INTERVIEW',
      resourceId: interview.id,
      details: {
        jobTitle: job.title,
        candidateName: interview.candidate.name,
        scheduledAt: interview.scheduledAt,
        interviewerName,
      },
    });

    return {
      id: interview.id,
      companyId: interview.companyId,
      jobId: interview.jobId,
      jobTitle: interview.job.title,
      applicationId: interview.applicationId,
      candidateId: interview.candidateId,
      candidateName: interview.candidate.name,
      candidateEmail: interview.candidate.email,
      candidateAvatar: interview.candidate.avatarUrl,
      interviewerId: interview.interviewerId,
      interviewerName: interview.interviewerName,
      title: interview.title,
      type: interview.type,
      scheduledAt: interview.scheduledAt.toISOString(),
      durationMinutes: interview.durationMinutes,
      meetingUrl: interview.meetingUrl,
      notes: interview.notes,
      feedback: interview.feedback,
      rating: interview.rating,
      recommendation: interview.recommendation,
      feedbackSubmittedAt: interview.feedbackSubmittedAt
        ? interview.feedbackSubmittedAt.toISOString()
        : null,
      status: interview.status,
      createdAt: interview.createdAt.toISOString(),
    };
  }

  /**
   * Assigns or reassigns an interviewer to an interview.
   */
  static async assignInterviewer(
    interviewId: string,
    data: z.infer<typeof InterviewAssignSchema>,
    auth: AuthenticatedRecruiter
  ) {
    const validated = InterviewAssignSchema.parse(data);

    // Verify interview access with assign permission check
    const interview = await RecruiterRbacService.assertInterviewAccess(
      auth,
      interviewId,
      'assign'
    );

    // Verify assigned user is a member of this company
    const member = await db.companyMember.findFirst({
      where: {
        companyId: auth.company.id,
        userId: validated.interviewerId,
        status: 'ACTIVE',
      },
      include: { user: true },
    });

    if (!member) {
      throw new RecruiterAuthError('Assigned interviewer is not an active member of this company.', 400);
    }

    const interviewerName = member.user.name;

    const updated = await db.interview.update({
      where: { id: interviewId },
      data: {
        interviewerId: member.userId,
        interviewerName,
        ...(validated.meetingUrl !== undefined ? { meetingUrl: validated.meetingUrl } : {}),
        ...(validated.scheduledAt ? { scheduledAt: new Date(validated.scheduledAt) } : {}),
        ...(validated.notes !== undefined ? { notes: validated.notes } : {}),
      },
      include: {
        candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
    });

    // Notify assigned interviewer
    EmailService.sendInterviewerAssignmentNotificationEmail({
      interviewerEmail: member.user.email,
      interviewerName: member.user.name,
      candidateName: updated.candidate.name,
      jobTitle: updated.job.title,
      interviewType: updated.type,
      scheduledAt: updated.scheduledAt.toISOString(),
      durationMinutes: updated.durationMinutes,
      meetingUrl: updated.meetingUrl,
      companyName: auth.company.name,
    }).catch(() => {});

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INTERVIEWER_ASSIGNED',
      resourceType: 'INTERVIEW',
      resourceId: updated.id,
      details: {
        interviewerId: member.userId,
        interviewerName,
        scheduledAt: updated.scheduledAt,
      },
    });

    return {
      id: updated.id,
      companyId: updated.companyId,
      jobId: updated.jobId,
      jobTitle: updated.job.title,
      applicationId: updated.applicationId,
      candidateId: updated.candidateId,
      candidateName: updated.candidate.name,
      candidateEmail: updated.candidate.email,
      candidateAvatar: updated.candidate.avatarUrl,
      interviewerId: updated.interviewerId,
      interviewerName: updated.interviewerName,
      title: updated.title,
      type: updated.type,
      scheduledAt: updated.scheduledAt.toISOString(),
      durationMinutes: updated.durationMinutes,
      meetingUrl: updated.meetingUrl,
      notes: updated.notes,
      feedback: updated.feedback,
      rating: updated.rating,
      recommendation: updated.recommendation,
      feedbackSubmittedAt: updated.feedbackSubmittedAt
        ? updated.feedbackSubmittedAt.toISOString()
        : null,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Submits structured feedback for an interview with strict role and assignment checks.
   */
  static async submitFeedback(
    interviewId: string,
    data: z.infer<typeof InterviewFeedbackSchema>,
    auth: AuthenticatedRecruiter
  ) {
    const validated = InterviewFeedbackSchema.parse(data);

    // Interview access and feedback type permission
    const interview = await db.interview.findFirst({
      where: { id: interviewId, companyId: auth.company.id },
    });

    if (!interview) {
      throw new RecruiterAuthError('Interview not found or access denied.', 404);
    }

    const action =
      interview.type === 'TECHNICAL' ? 'feedback_technical' : 'feedback_hr';

    await RecruiterRbacService.assertInterviewAccess(auth, interviewId, action);

    const updated = await db.interview.update({
      where: { id: interviewId },
      data: {
        feedback: validated.feedback,
        rating: validated.rating || null,
        recommendation: validated.recommendation,
        feedbackSubmittedAt: new Date(),
        status: 'COMPLETED',
      },
      include: {
        candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INTERVIEW_FEEDBACK_SUBMITTED',
      resourceType: 'INTERVIEW',
      resourceId: updated.id,
      details: {
        recommendation: validated.recommendation,
        rating: validated.rating,
      },
    });

    return {
      id: updated.id,
      companyId: updated.companyId,
      jobId: updated.jobId,
      jobTitle: updated.job.title,
      applicationId: updated.applicationId,
      candidateId: updated.candidateId,
      candidateName: updated.candidate.name,
      candidateEmail: updated.candidate.email,
      candidateAvatar: updated.candidate.avatarUrl,
      interviewerId: updated.interviewerId,
      interviewerName: updated.interviewerName,
      title: updated.title,
      type: updated.type,
      scheduledAt: updated.scheduledAt.toISOString(),
      durationMinutes: updated.durationMinutes,
      meetingUrl: updated.meetingUrl,
      notes: updated.notes,
      feedback: updated.feedback,
      rating: updated.rating,
      recommendation: updated.recommendation,
      feedbackSubmittedAt: updated.feedbackSubmittedAt
        ? updated.feedbackSubmittedAt.toISOString()
        : null,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Updates or reschedules an interview.
   */
  static async updateInterview(
    id: string,
    data: z.infer<typeof RecruiterInterviewUpdateSchema>,
    auth: AuthenticatedRecruiter
  ) {
    RecruiterRbacService.assertPermission(auth, 'interviews:schedule');

    const validated = RecruiterInterviewUpdateSchema.parse(data);

    const existing = await RecruiterRbacService.assertInterviewAccess(auth, id, 'view');

    const updated = await db.interview.update({
      where: { id },
      data: {
        ...(validated.title !== undefined ? { title: validated.title } : {}),
        ...(validated.type !== undefined ? { type: validated.type } : {}),
        ...(validated.scheduledAt !== undefined
          ? { scheduledAt: new Date(validated.scheduledAt) }
          : {}),
        ...(validated.durationMinutes !== undefined
          ? { durationMinutes: validated.durationMinutes }
          : {}),
        ...(validated.meetingUrl !== undefined ? { meetingUrl: validated.meetingUrl } : {}),
        ...(validated.interviewerName !== undefined
          ? { interviewerName: validated.interviewerName }
          : {}),
        ...(validated.notes !== undefined ? { notes: validated.notes } : {}),
        ...(validated.status !== undefined ? { status: validated.status } : {}),
      },
      include: {
        candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INTERVIEW_UPDATED',
      resourceType: 'INTERVIEW',
      resourceId: updated.id,
      details: { newStatus: updated.status, scheduledAt: updated.scheduledAt },
    });

    return {
      id: updated.id,
      companyId: updated.companyId,
      jobId: updated.jobId,
      jobTitle: updated.job.title,
      applicationId: updated.applicationId,
      candidateId: updated.candidateId,
      candidateName: updated.candidate.name,
      candidateEmail: updated.candidate.email,
      candidateAvatar: updated.candidate.avatarUrl,
      interviewerId: updated.interviewerId,
      interviewerName: updated.interviewerName,
      title: updated.title,
      type: updated.type,
      scheduledAt: updated.scheduledAt.toISOString(),
      durationMinutes: updated.durationMinutes,
      meetingUrl: updated.meetingUrl,
      notes: updated.notes,
      feedback: updated.feedback,
      rating: updated.rating,
      recommendation: updated.recommendation,
      feedbackSubmittedAt: updated.feedbackSubmittedAt
        ? updated.feedbackSubmittedAt.toISOString()
        : null,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
