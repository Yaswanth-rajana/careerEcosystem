import { db } from '../../db/client';
import {
  RecruiterApplicationListDTO,
  RecruiterApplicationDetailDTO,
  AuthenticatedRecruiter,
} from '../../types/recruiter';
import { ApplicationStatus } from '../../types/jobs';
import { AuditService } from '../auditService';

export interface ListRecruiterApplicationsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  jobId?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class RecruiterApplicationService {
  /**
   * Retrieves paginated applications strictly for the recruiter's company jobs.
   */
  static async listApplications(companyId: string, params: ListRecruiterApplicationsParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {
      job: {
        companyId,
      },
    };

    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.jobId && params.jobId !== 'All') {
      where.jobId = params.jobId;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { candidate: { name: { contains: q, mode: 'insensitive' } } },
        { candidate: { email: { contains: q, mode: 'insensitive' } } },
        { job: { title: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, applications] = await Promise.all([
      db.jobApplication.count({ where }),
      db.jobApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
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
                  location: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          assessmentSubmissions: {
            select: {
              score: true,
            },
            take: 1,
            orderBy: { submittedAt: 'desc' },
          },
        },
      }),
    ]);

    const items: RecruiterApplicationListDTO[] = applications.map((app) => ({
      id: app.id,
      candidateId: app.candidate.id,
      candidateName: app.candidate.name,
      candidateEmail: app.candidate.email,
      candidateAvatar: app.candidate.avatarUrl,
      candidateHeadline: app.candidate.profile?.headline || null,
      candidateLocation: app.candidate.profile?.location || null,
      jobId: app.job.id,
      jobTitle: app.job.title,
      status: app.status as ApplicationStatus,
      appliedAt: app.createdAt.toISOString(),
      hasResume: Boolean(app.resumeUrl),
      resumeUrl: app.resumeUrl,
      latestScore: app.assessmentSubmissions?.[0]?.score || null,
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
   * Retrieves full application details with candidate profile, verifying company ownership.
   */
  static async getApplicationDetail(
    applicationId: string,
    companyId: string
  ): Promise<RecruiterApplicationDetailDTO> {
    const app = await db.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: { companyId },
      },
      include: {
        job: {
          select: { id: true, title: true, companyId: true },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: {
              include: {
                userSkills: {
                  include: { skill: true },
                },
                education: true,
                experience: true,
                projects: true,
                professionalLinks: true,
              },
            },
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'desc' },
        },
        offers: {
          orderBy: { createdAt: 'desc' },
        },
        assessmentSubmissions: {
          include: { assessment: { select: { title: true } } },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!app) {
      throw new Error('Application not found or access denied.');
    }

    const p = app.candidate.profile;

    return {
      id: app.id,
      jobId: app.job.id,
      jobTitle: app.job.title,
      status: app.status as ApplicationStatus,
      coverNote: app.coverNote,
      answers: app.answers,
      resumeUrl: app.resumeUrl,
      feedback: app.feedback,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      withdrawnAt: app.withdrawnAt?.toISOString() || null,
      createdAt: app.createdAt.toISOString(),
      candidate: {
        id: app.candidate.id,
        name: app.candidate.name,
        email: app.candidate.email,
        avatarUrl: app.candidate.avatarUrl,
        phone: p?.phone || null,
        location: p?.location || null,
        headline: p?.headline || null,
        candidateType: p?.candidateType || null,
        totalExperience: p?.totalExperience || null,
        bio: p?.bio || null,
        skills: (p?.userSkills || []).map((us) => ({
          name: us.skill.name,
          level: us.level,
          verified: us.verified,
        })),
        education: (p?.education || []).map((ed) => ({
          id: ed.id,
          institution: ed.institution,
          degree: ed.degree,
          fieldOfStudy: ed.fieldOfStudy,
          startYear: ed.startYear,
          endYear: ed.endYear,
        })),
        experience: (p?.experience || []).map((ex) => ({
          id: ex.id,
          company: ex.company,
          roleTitle: ex.roleTitle,
          startDate: ex.startDate,
          endDate: ex.endDate,
          isCurrent: ex.isCurrent,
          description: ex.description,
        })),
        projects: (p?.projects || []).map((pr) => ({
          id: pr.id,
          title: pr.title,
          description: pr.description,
          technologies: pr.technologies,
          projectUrl: pr.projectUrl,
          githubUrl: pr.githubUrl,
        })),
        professionalLinks: (p?.professionalLinks || []).map((pl) => ({
          platform: pl.platform,
          url: pl.url,
        })),
      },
      interviews: app.interviews.map((inv) => ({
        id: inv.id,
        title: inv.title,
        type: inv.type,
        scheduledAt: inv.scheduledAt.toISOString(),
        durationMinutes: inv.durationMinutes,
        meetingUrl: inv.meetingUrl,
        status: inv.status,
      })),
      offers: app.offers.map((off) => ({
        id: off.id,
        positionTitle: off.positionTitle,
        salaryOffered: off.salaryOffered,
        currency: off.currency,
        status: off.status,
        startDate: off.startDate?.toISOString() || null,
      })),
      assessmentSubmissions: app.assessmentSubmissions.map((sub) => ({
        id: sub.id,
        assessmentTitle: sub.assessment.title,
        score: sub.score,
        passed: sub.passed,
        submittedAt: sub.submittedAt.toISOString(),
      })),
    };
  }

  /**
   * Updates pipeline stage & feedback notes.
   */
  static async updateApplicationStatus(
    applicationId: string,
    companyId: string,
    status: ApplicationStatus,
    feedback: string | null | undefined,
    auth: AuthenticatedRecruiter
  ) {
    const app = await db.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: { companyId },
      },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    });

    if (!app) {
      throw new Error('Application not found or access denied.');
    }

    const previousStatus = app.status;

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        ...(feedback !== undefined ? { feedback } : {}),
        reviewedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_APPLICATION_STATUS_UPDATED',
      resourceType: 'APPLICATION',
      resourceId: updated.id,
      details: {
        jobTitle: app.job.title,
        candidateName: app.candidate.name,
        previousStatus,
        newStatus: status,
      },
    });

    return this.getApplicationDetail(updated.id, companyId);
  }
}
