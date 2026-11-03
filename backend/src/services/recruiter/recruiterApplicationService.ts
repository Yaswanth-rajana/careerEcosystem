import { db } from '../../db/client';
import {
  RecruiterApplicationListDTO,
  RecruiterApplicationDetailDTO,
  AuthenticatedRecruiter,
} from '../../types/recruiter';
import { ApplicationStatus } from '../../types/jobs';
import { AuditService } from '../auditService';
import { EmailService } from '../email/emailService';
import { RecruiterRbacService } from './recruiterRbacService';

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
  static async listApplications(
    companyId: string,
    params: ListRecruiterApplicationsParams = {},
    auth?: AuthenticatedRecruiter
  ) {
    if (auth) {
      RecruiterRbacService.assertActiveMembership(auth);
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {
      job: {
        companyId,
      },
    };

    if (auth) {
      if (
        auth.companyRole === 'HIRING_MANAGER' &&
        auth.membership.assignedJobIds.length > 0
      ) {
        where.jobId = { in: auth.membership.assignedJobIds };
      } else if (
        auth.companyRole === 'TECHNICAL_INTERVIEWER' ||
        auth.companyRole === 'HR_INTERVIEWER'
      ) {
        const assignedInterviews = await db.interview.findMany({
          where: {
            companyId,
            OR: [
              { interviewerId: auth.user.id },
              { interviewerName: auth.user.name },
            ],
          },
          select: { applicationId: true },
        });
        const assignedIds = assignedInterviews.map((i) => i.applicationId);
        where.id = { in: assignedIds };
      }
    }

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
                  resumes: {
                    select: { id: true, filename: true },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                  },
                },
              },
            },
          },
          resume: {
            select: { id: true, filename: true, fileSize: true, fileType: true },
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

    const items: RecruiterApplicationListDTO[] = applications.map((app) => {
      const profileResume = app.candidate.profile?.resumes?.[0];
      const resumeFilename = app.resumeFilename || app.resume?.filename || profileResume?.filename || null;
      const hasResume = Boolean(app.resumeId || app.resumeFilename || app.resumeUrl || profileResume);
      const resumeUrl = hasResume ? `/api/recruiter/applications/${app.id}/resume` : null;

      return {
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
        hasResume,
        resumeUrl,
        resumeFilename,
        latestScore: app.assessmentSubmissions?.[0]?.score || null,
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
   * Retrieves full application details with candidate profile, verifying company ownership.
   */
  static async getApplicationDetail(
    applicationId: string,
    companyId: string,
    auth?: AuthenticatedRecruiter
  ): Promise<RecruiterApplicationDetailDTO> {
    if (auth) {
      await RecruiterRbacService.assertApplicationAccess(auth, applicationId);
    }

    const app = await db.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: { companyId },
      },
      include: {
        job: {
          select: { id: true, title: true, companyId: true },
        },
        resume: {
          select: { id: true, filename: true, fileSize: true, fileType: true },
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
                certifications: true,
                professionalLinks: true,
                resumes: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
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
    const profileResume = p?.resumes?.[0] || null;
    const resumeFilename = app.resumeFilename || app.resume?.filename || profileResume?.filename || null;
    const resumeFileSize = app.resumeFileSize || app.resume?.fileSize || profileResume?.fileSize || null;
    const resumeFileType = app.resumeFileType || app.resume?.fileType || profileResume?.fileType || null;
    const hasResume = Boolean(app.resumeId || app.resumeFilename || app.resumeUrl || profileResume);
    const resumeUrl = hasResume ? `/api/recruiter/applications/${app.id}/resume` : null;
    const resumeId = app.resumeId || app.resume?.id || profileResume?.id || null;

    return {
      id: app.id,
      jobId: app.job.id,
      jobTitle: app.job.title,
      status: app.status as ApplicationStatus,
      coverNote: app.coverNote,
      answers: app.answers,
      hasResume,
      resumeUrl,
      resumeId,
      resumeFilename,
      resumeFileSize,
      resumeFileType,
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
          location: ed.location || null,
          startYear: ed.startYear,
          endYear: ed.endYear || null,
          isCurrent: ed.isCurrent,
          gpa: ed.gpa || null,
          coursework: ed.coursework || null,
          achievements: ed.achievements || null,
        })),
        experience: (p?.experience || []).map((ex) => ({
          id: ex.id,
          company: ex.company,
          roleTitle: ex.roleTitle,
          employmentType: ex.employmentType || null,
          location: ex.location || null,
          startDate: ex.startDate,
          endDate: ex.endDate || null,
          isCurrent: ex.isCurrent,
          description: ex.description || null,
          responsibilities: ex.responsibilities || null,
          achievements: ex.achievements || null,
        })),
        projects: (p?.projects || []).map((pr) => ({
          id: pr.id,
          title: pr.title,
          description: pr.description || null,
          role: pr.role || null,
          technologies: pr.technologies || [],
          projectUrl: pr.projectUrl || null,
          githubUrl: pr.githubUrl || null,
          demoUrl: pr.demoUrl || null,
        })),
        certifications: (p?.certifications || []).map((cert) => ({
          id: cert.id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate || null,
          expiryDate: cert.expiryDate || null,
          credentialUrl: cert.credentialUrl || null,
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
    RecruiterRbacService.assertPermission(auth, 'pipeline:transition');
    await RecruiterRbacService.assertApplicationAccess(auth, applicationId);

    const ALLOWED_STATUSES: ApplicationStatus[] = [
      'APPLIED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'TASK_PENDING',
      'TASK_SUBMITTED',
      'INTERVIEW',
      'OFFER',
      'REJECTED',
      'WITHDRAWN',
    ];

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error(`Invalid application status: ${status}`);
    }

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

    if (app.status === 'WITHDRAWN') {
      throw new Error('Cannot update an application that was withdrawn by the candidate.');
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

    // Safe, non-blocking notification dispatch
    Promise.resolve().then(async () => {
      try {
        await EmailService.sendCandidateStatusUpdatedEmail({
          candidateEmail: app.candidate.email,
          candidateName: app.candidate.name,
          jobTitle: app.job.title,
          companyName: auth.company.name,
          status,
          feedback: null, // Internal recruiter evaluations are never exposed to candidate
        });
      } catch (err) {
        console.error('[RecruiterApplicationService] Status update email error:', err);
      }
    });

    return this.getApplicationDetail(updated.id, companyId);
  }
}
