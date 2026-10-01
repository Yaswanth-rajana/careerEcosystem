import { db } from '../db/client';
import {
  ApplicationDTO,
  ApplicationStatus,
  PaginatedResult,
} from '../types/jobs';
import { JobApplySchema } from '../validations/jobSchemas';

export class ApplicationService {
  /**
   * Submits a candidate application for a published job.
   * Protects against duplicate rapid applications and enforces candidate ownership.
   */
  static async applyToJob(
    candidateId: string,
    jobId: string,
    input?: { coverNote?: string; answers?: any; resumeUrl?: string }
  ): Promise<ApplicationDTO> {
    if (!candidateId || !jobId) {
      throw new Error('Candidate ID and Job ID are required');
    }

    const validated = input ? JobApplySchema.parse(input) : {};

    // 1. Verify job exists and is open for applications
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        company: true,
        companyLogo: true,
        location: true,
        workMode: true,
        employmentType: true,
        experienceLevel: true,
        status: true,
      },
    });

    if (!job || job.status !== 'PUBLISHED') {
      throw new Error('This job is no longer accepting applications.');
    }

    // 2. Check for existing application
    const existing = await db.jobApplication.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existing) {
      if (existing.status !== 'WITHDRAWN') {
        throw new Error('You have already submitted an application for this position.');
      }

      // Re-activating a withdrawn application
      const updated = await db.jobApplication.update({
        where: { id: existing.id },
        data: {
          status: 'APPLIED',
          coverNote: validated.coverNote || null,
          answers: validated.answers ? JSON.stringify(validated.answers) : null,
          resumeUrl: validated.resumeUrl || null,
          withdrawnAt: null,
          updatedAt: new Date(),
        },
      });

      return {
        id: updated.id,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.companyLogo || null,
        location: job.location,
        workMode: job.workMode,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        appliedAt: updated.createdAt.toISOString(),
        status: updated.status as ApplicationStatus,
        coverNote: updated.coverNote,
        feedback: updated.feedback,
        reviewedAt: updated.reviewedAt?.toISOString() || null,
        withdrawnAt: null,
      };
    }

    // 3. Create fresh application
    const application = await db.jobApplication.create({
      data: {
        candidateId,
        jobId,
        status: 'APPLIED',
        coverNote: validated.coverNote || null,
        answers: validated.answers ? JSON.stringify(validated.answers) : null,
        resumeUrl: validated.resumeUrl || null,
      },
    });

    return {
      id: application.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      companyLogo: job.companyLogo || null,
      location: job.location,
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      appliedAt: application.createdAt.toISOString(),
      status: application.status as ApplicationStatus,
      coverNote: application.coverNote,
      feedback: application.feedback,
      reviewedAt: null,
      withdrawnAt: null,
    };
  }

  /**
   * Withdraws an application by ID.
   * Strictly enforces candidate ownership.
   */
  static async withdrawApplication(
    candidateId: string,
    applicationId: string
  ): Promise<ApplicationDTO> {
    if (!candidateId || !applicationId) {
      throw new Error('Application ID is required');
    }

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            companyLogo: true,
            location: true,
            workMode: true,
            employmentType: true,
            experienceLevel: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Strict IDOR ownership check
    if (application.candidateId !== candidateId) {
      throw new Error('Unauthorized to modify this application');
    }

    if (application.status === 'WITHDRAWN') {
      throw new Error('Application has already been withdrawn');
    }

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
      },
    });

    return {
      id: updated.id,
      jobId: application.job.id,
      jobTitle: application.job.title,
      company: application.job.company,
      companyLogo: application.job.companyLogo || null,
      location: application.job.location,
      workMode: application.job.workMode,
      employmentType: application.job.employmentType,
      experienceLevel: application.job.experienceLevel,
      appliedAt: updated.createdAt.toISOString(),
      status: 'WITHDRAWN',
      coverNote: updated.coverNote,
      feedback: updated.feedback,
      reviewedAt: updated.reviewedAt?.toISOString() || null,
      withdrawnAt: updated.withdrawnAt?.toISOString() || null,
    };
  }

  /**
   * Retrieves an application by ID.
   * Strictly enforces candidate ownership.
   */
  static async getApplication(
    candidateId: string,
    applicationId: string
  ): Promise<ApplicationDTO | null> {
    if (!candidateId || !applicationId) return null;

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            companyLogo: true,
            location: true,
            workMode: true,
            employmentType: true,
            experienceLevel: true,
          },
        },
      },
    });

    if (!application || application.candidateId !== candidateId) {
      return null;
    }

    return {
      id: application.id,
      jobId: application.job.id,
      jobTitle: application.job.title,
      company: application.job.company,
      companyLogo: application.job.companyLogo || null,
      location: application.job.location,
      workMode: application.job.workMode,
      employmentType: application.job.employmentType,
      experienceLevel: application.job.experienceLevel,
      appliedAt: application.createdAt.toISOString(),
      status: application.status as ApplicationStatus,
      coverNote: application.coverNote,
      feedback: application.feedback,
      reviewedAt: application.reviewedAt?.toISOString() || null,
      withdrawnAt: application.withdrawnAt?.toISOString() || null,
    };
  }

  /**
   * Lists all applications for the authenticated candidate.
   */
  static async listApplications(
    candidateId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<ApplicationDTO>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [total, rawApps] = await Promise.all([
      db.jobApplication.count({
        where: { candidateId },
      }),
      db.jobApplication.findMany({
        where: { candidateId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              companyLogo: true,
              location: true,
              workMode: true,
              employmentType: true,
              experienceLevel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit,
      }),
    ]);

    const items: ApplicationDTO[] = rawApps.map((app) => ({
      id: app.id,
      jobId: app.job.id,
      jobTitle: app.job.title,
      company: app.job.company,
      companyLogo: app.job.companyLogo || null,
      location: app.job.location,
      workMode: app.job.workMode,
      employmentType: app.job.employmentType,
      experienceLevel: app.job.experienceLevel,
      appliedAt: app.createdAt.toISOString(),
      status: app.status as ApplicationStatus,
      coverNote: app.coverNote,
      feedback: app.feedback,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      withdrawnAt: app.withdrawnAt?.toISOString() || null,
    }));

    const totalPages = Math.ceil(total / validLimit) || 1;

    return {
      items,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    };
  }
}
