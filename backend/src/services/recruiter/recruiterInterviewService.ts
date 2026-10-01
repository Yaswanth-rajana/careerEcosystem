import { db } from '../../db/client';
import { RecruiterInterviewDTO, AuthenticatedRecruiter } from '../../types/recruiter';
import { RecruiterInterviewCreateSchema, RecruiterInterviewUpdateSchema } from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { z } from 'zod';

export class RecruiterInterviewService {
  /**
   * Retrieves interviews strictly for the recruiter's company.
   */
  static async listInterviews(companyId: string, filter?: 'upcoming' | 'today' | 'completed' | 'all') {
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
      title: inv.title,
      type: inv.type,
      scheduledAt: inv.scheduledAt.toISOString(),
      durationMinutes: inv.durationMinutes,
      meetingUrl: inv.meetingUrl,
      interviewerName: inv.interviewerName,
      notes: inv.notes,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    }));

    return items;
  }

  /**
   * Schedules a new interview for a candidate application.
   */
  static async scheduleInterview(data: z.infer<typeof RecruiterInterviewCreateSchema>, auth: AuthenticatedRecruiter) {
    const validated = RecruiterInterviewCreateSchema.parse(data);

    // Verify job belongs to company
    const job = await db.job.findFirst({
      where: { id: validated.jobId, companyId: auth.company.id },
    });
    if (!job) {
      throw new Error('Job not found or access denied.');
    }

    const interview = await db.interview.create({
      data: {
        companyId: auth.company.id,
        jobId: validated.jobId,
        applicationId: validated.applicationId,
        candidateId: validated.candidateId,
        title: validated.title,
        type: validated.type,
        scheduledAt: new Date(validated.scheduledAt),
        durationMinutes: validated.durationMinutes,
        meetingUrl: validated.meetingUrl || null,
        interviewerName: validated.interviewerName || auth.user.name,
        notes: validated.notes || null,
        status: 'SCHEDULED',
      },
      include: {
        candidate: { select: { id: true, name: true, email: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
    });

    // Automatically transition application status to INTERVIEW if applicable
    await db.jobApplication.update({
      where: { id: validated.applicationId },
      data: { status: 'INTERVIEW', reviewedAt: new Date() },
    }).catch(() => {});

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
      title: interview.title,
      type: interview.type,
      scheduledAt: interview.scheduledAt.toISOString(),
      durationMinutes: interview.durationMinutes,
      meetingUrl: interview.meetingUrl,
      interviewerName: interview.interviewerName,
      notes: interview.notes,
      status: interview.status,
      createdAt: interview.createdAt.toISOString(),
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
    const validated = RecruiterInterviewUpdateSchema.parse(data);

    const existing = await db.interview.findFirst({
      where: { id, companyId: auth.company.id },
    });
    if (!existing) {
      throw new Error('Interview not found or access denied.');
    }

    const updated = await db.interview.update({
      where: { id },
      data: {
        ...(validated.title !== undefined ? { title: validated.title } : {}),
        ...(validated.type !== undefined ? { type: validated.type } : {}),
        ...(validated.scheduledAt !== undefined ? { scheduledAt: new Date(validated.scheduledAt) } : {}),
        ...(validated.durationMinutes !== undefined ? { durationMinutes: validated.durationMinutes } : {}),
        ...(validated.meetingUrl !== undefined ? { meetingUrl: validated.meetingUrl } : {}),
        ...(validated.interviewerName !== undefined ? { interviewerName: validated.interviewerName } : {}),
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
      title: updated.title,
      type: updated.type,
      scheduledAt: updated.scheduledAt.toISOString(),
      durationMinutes: updated.durationMinutes,
      meetingUrl: updated.meetingUrl,
      interviewerName: updated.interviewerName,
      notes: updated.notes,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
