import { db } from '../db/client';
import {
  ApplicationDTO,
  ApplicationStatus,
  CandidateInterviewDTO,
  CandidateOfferDTO,
  PaginatedResult,
} from '../types/jobs';
import { JobApplySchema } from '../validations/jobSchemas';
import { JobExpirationService } from './jobExpirationService';
import { EmailService } from './email/emailService';

import { StorageFactory } from './tools/storage-provider';

export class ApplicationService {
  /**
   * Safely cleans up newly uploaded resume record and storage file on failed application submission.
   * Never deletes pre-existing candidate resumes.
   */
  private static async cleanupNewlyUploadedResume(resumeId: string, filename?: string) {
    try {
      const storage = StorageFactory.getProvider();
      if (filename) {
        const storageKey = `resumes/${resumeId}/${filename}`;
        if (await storage.exists(storageKey)) {
          await storage.delete(storageKey);
        }
      }
      await db.resume.deleteMany({
        where: { id: resumeId },
      });
    } catch (cleanupErr) {
      console.warn('[ApplicationService] Failed to clean up orphaned resume:', cleanupErr);
    }
  }

  /**
   * Submits a candidate application for a published job.
   * Enforces resume selection or upload, candidate ownership of the resume,
   * creates an immutable application-specific resume reference snapshot,
   * protects against duplicate rapid applications, and cleans up orphaned files on failure.
   */
  static async applyToJob(
    candidateId: string,
    jobId: string,
    input?: { coverNote?: string; answers?: any; resumeUrl?: string; resumeId?: string; isNewUpload?: boolean }
  ): Promise<ApplicationDTO> {
    if (!candidateId || !jobId) {
      throw new Error('Candidate ID and Job ID are required');
    }

    const validated = input ? JobApplySchema.parse(input) : {};

    // 1. Verify candidate exists and is active
    const candidate = await db.user.findUnique({
      where: { id: candidateId },
      select: { id: true, name: true, email: true, status: true },
    });

    if (!candidate || candidate.status !== 'ACTIVE') {
      if (validated.isNewUpload && validated.resumeId) {
        await this.cleanupNewlyUploadedResume(validated.resumeId);
      }
      throw new Error('Candidate account is inactive or not found.');
    }

    // 2. Verify job exists and is open for applications (must be PUBLISHED, non-expired, and valid company)
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        company: true,
        companyLogo: true,
        companyId: true,
        companyRef: {
          select: { id: true, status: true },
        },
        location: true,
        workMode: true,
        employmentType: true,
        experienceLevel: true,
        status: true,
        publishedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!job || job.status !== 'PUBLISHED' || JobExpirationService.isJobExpired(job)) {
      if (validated.isNewUpload && validated.resumeId) {
        await this.cleanupNewlyUploadedResume(validated.resumeId);
      }
      throw new Error('This job is no longer accepting applications.');
    }

    if (job.companyRef && job.companyRef.status === 'SUSPENDED') {
      if (validated.isNewUpload && validated.resumeId) {
        await this.cleanupNewlyUploadedResume(validated.resumeId);
      }
      throw new Error('This company is not currently accepting applications.');
    }

    // 3. Prevent duplicate applications early
    const existing = await db.jobApplication.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existing && existing.status !== 'WITHDRAWN') {
      if (validated.isNewUpload && validated.resumeId) {
        await this.cleanupNewlyUploadedResume(validated.resumeId);
      }
      throw new Error('You have already submitted an application for this position.');
    }

    // 4. Verify and resolve resume selection
    let selectedResume: {
      id: string;
      filename: string;
      fileSize: number;
      fileType: string;
    } | null = null;

    if (validated.resumeId) {
      const resume = await db.resume.findUnique({
        where: { id: validated.resumeId },
        include: { profile: { select: { userId: true } } },
      });

      if (!resume || resume.profile?.userId !== candidateId) {
        if (validated.isNewUpload && validated.resumeId) {
          await this.cleanupNewlyUploadedResume(validated.resumeId, resume?.filename);
        }
        throw new Error('Selected resume not found or you do not have permission to attach it.');
      }

      selectedResume = {
        id: resume.id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
      };
    } else {
      // Look for candidate's existing active resume
      const candidateResume = await db.resume.findFirst({
        where: { profile: { userId: candidateId }, status: 'READY' },
        orderBy: { createdAt: 'desc' },
        include: { profile: { select: { userId: true } } },
      });

      if (candidateResume) {
        selectedResume = {
          id: candidateResume.id,
          filename: candidateResume.filename,
          fileSize: candidateResume.fileSize,
          fileType: candidateResume.fileType,
        };
      }
    }

    // Require resume: candidate cannot submit without a resume
    if (!selectedResume && !validated.resumeUrl) {
      throw new Error('A resume must be selected or uploaded before submitting your application.');
    }

    if (existing) {
      if (existing.status !== 'WITHDRAWN') {
        if (validated.isNewUpload && validated.resumeId) {
          await this.cleanupNewlyUploadedResume(validated.resumeId, selectedResume?.filename);
        }
        throw new Error('You have already submitted an application for this position.');
      }

      try {
        const resumeUrl = selectedResume
          ? `/api/recruiter/applications/${existing.id}/resume`
          : (validated.resumeUrl || null);

        // Re-activating a withdrawn application
        const updated = await db.jobApplication.update({
          where: { id: existing.id },
          data: {
            status: 'APPLIED',
            coverNote: validated.coverNote || null,
            answers: validated.answers ? JSON.stringify(validated.answers) : null,
            resumeUrl,
            resumeId: selectedResume ? selectedResume.id : null,
            resumeFilename: selectedResume ? selectedResume.filename : null,
            resumeFileSize: selectedResume ? selectedResume.fileSize : null,
            resumeFileType: selectedResume ? selectedResume.fileType : null,
            withdrawnAt: null,
            updatedAt: new Date(),
          },
        });

        // Safe, non-blocking notification delivery
        const emailNotification = await this.dispatchApplicationNotifications(
          candidate,
          job,
          updated.id,
          updated.createdAt,
          updated.status
        );

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
          feedback: null,
          reviewedAt: updated.reviewedAt?.toISOString() || null,
          withdrawnAt: null,
          resumeUrl: updated.resumeUrl,
          resumeId: updated.resumeId,
          resumeFilename: updated.resumeFilename,
          resumeFileSize: updated.resumeFileSize,
          resumeFileType: updated.resumeFileType,
          emailNotification,
        };
      } catch (updateErr) {
        if (validated.isNewUpload && validated.resumeId) {
          await this.cleanupNewlyUploadedResume(validated.resumeId, selectedResume?.filename);
        }
        throw updateErr;
      }
    }

    // 5. Create fresh application
    try {
      const application = await db.jobApplication.create({
        data: {
          candidateId,
          jobId,
          status: 'APPLIED',
          coverNote: validated.coverNote || null,
          answers: validated.answers ? JSON.stringify(validated.answers) : null,
          resumeId: selectedResume ? selectedResume.id : null,
          resumeFilename: selectedResume ? selectedResume.filename : null,
          resumeFileSize: selectedResume ? selectedResume.fileSize : null,
          resumeFileType: selectedResume ? selectedResume.fileType : null,
        },
      });

      const resumeUrl = selectedResume
        ? `/api/recruiter/applications/${application.id}/resume`
        : (validated.resumeUrl || null);

      const updatedApp = await db.jobApplication.update({
        where: { id: application.id },
        data: { resumeUrl },
      });

      // Safe, non-blocking notification delivery
      const emailNotification = await this.dispatchApplicationNotifications(
        candidate,
        job,
        updatedApp.id,
        updatedApp.createdAt,
        updatedApp.status
      );

      return {
        id: updatedApp.id,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.companyLogo || null,
        location: job.location,
        workMode: job.workMode,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        appliedAt: updatedApp.createdAt.toISOString(),
        status: updatedApp.status as ApplicationStatus,
        coverNote: updatedApp.coverNote,
        feedback: null,
        reviewedAt: null,
        withdrawnAt: null,
        resumeUrl: updatedApp.resumeUrl,
        resumeId: updatedApp.resumeId,
        resumeFilename: updatedApp.resumeFilename,
        resumeFileSize: updatedApp.resumeFileSize,
        resumeFileType: updatedApp.resumeFileType,
        emailNotification,
      };
    } catch (createErr) {
      if (validated.isNewUpload && validated.resumeId) {
        await this.cleanupNewlyUploadedResume(validated.resumeId, selectedResume?.filename);
      }
      throw createErr;
    }
  }

  /**
   * Helper to dispatch application confirmation and recruiter notification safely.
   * Failures are logged and never bubble up or rollback valid database transactions.
   */
  private static async dispatchApplicationNotifications(
    candidate: { name: string; email: string },
    job: { id: string; title: string; company: string; companyId?: string | null },
    applicationId: string,
    appliedDate?: Date,
    status?: string
  ): Promise<{ sent: boolean; simulated?: boolean; error?: string | null }> {
    let emailResult = { sent: false, simulated: false, error: null as string | null };

    // 1. Candidate confirmation email
    try {
      const res = await EmailService.sendCandidateApplicationConfirmationEmail({
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        jobTitle: job.title,
        companyName: job.company,
        applicationId,
        appliedDate,
        applicationStatus: status || 'APPLIED',
      });
      emailResult = {
        sent: res.success,
        simulated: res.simulated || false,
        error: res.error || null,
      };
    } catch (err: any) {
      console.error('[ApplicationService] Candidate email delivery exception:', err);
      emailResult = {
        sent: false,
        simulated: false,
        error: err.message || 'Delivery error',
      };
    }

    // 2. Non-blocking recruiter notification in background
    const targetCompanyId = job.companyId;
    if (targetCompanyId) {
      Promise.resolve().then(async () => {
        try {
          const recruiters = await db.companyMember.findMany({
            where: { companyId: targetCompanyId, status: 'ACTIVE' },
            include: { user: { select: { name: true, email: true } } },
            take: 5,
          });
          for (const rec of recruiters) {
            const recUser = (rec as any).user;
            if (recUser?.email) {
              await EmailService.sendRecruiterApplicationNotificationEmail({
                recruiterEmail: recUser.email,
                recruiterName: recUser.name,
                candidateName: candidate.name,
                jobTitle: job.title,
                companyName: job.company,
                applicationId,
              });
            }
          }
        } catch (recErr) {
          console.error('[ApplicationService] Recruiter alert email error:', recErr);
        }
      });
    }

    return emailResult;
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
      feedback: null,
      reviewedAt: updated.reviewedAt?.toISOString() || null,
      withdrawnAt: updated.withdrawnAt?.toISOString() || null,
      resumeUrl: updated.resumeUrl,
      resumeId: updated.resumeId,
      resumeFilename: updated.resumeFilename,
      resumeFileSize: updated.resumeFileSize,
      resumeFileType: updated.resumeFileType,
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
        interviews: {
          select: {
            id: true,
            title: true,
            type: true,
            scheduledAt: true,
            durationMinutes: true,
            meetingUrl: true,
            status: true,
          },
          orderBy: { scheduledAt: 'desc' },
        },
        offers: {
          select: {
            id: true,
            positionTitle: true,
            salaryOffered: true,
            currency: true,
            salaryPeriod: true,
            startDate: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
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
      feedback: null,
      reviewedAt: application.reviewedAt?.toISOString() || null,
      withdrawnAt: application.withdrawnAt?.toISOString() || null,
      resumeUrl: application.resumeUrl,
      resumeId: application.resumeId,
      resumeFilename: application.resumeFilename,
      resumeFileSize: application.resumeFileSize,
      resumeFileType: application.resumeFileType,
      interviews: (application.interviews || []).map((inv) => ({
        id: inv.id,
        title: inv.title,
        type: inv.type,
        scheduledAt: inv.scheduledAt.toISOString(),
        durationMinutes: inv.durationMinutes,
        meetingUrl: inv.meetingUrl,
        status: inv.status,
      })),
      offers: (application.offers || []).map((off) => ({
        id: off.id,
        positionTitle: off.positionTitle,
        salaryOffered: off.salaryOffered,
        currency: off.currency,
        salaryPeriod: off.salaryPeriod,
        startDate: off.startDate?.toISOString() || null,
        status: off.status,
      })),
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
          interviews: {
            select: {
              id: true,
              title: true,
              type: true,
              scheduledAt: true,
              durationMinutes: true,
              meetingUrl: true,
              status: true,
            },
            orderBy: { scheduledAt: 'desc' },
          },
          offers: {
            select: {
              id: true,
              positionTitle: true,
              salaryOffered: true,
              currency: true,
              salaryPeriod: true,
              startDate: true,
              status: true,
            },
            orderBy: { createdAt: 'desc' },
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
      feedback: null,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      withdrawnAt: app.withdrawnAt?.toISOString() || null,
      resumeUrl: app.resumeUrl,
      resumeId: app.resumeId,
      resumeFilename: app.resumeFilename,
      resumeFileSize: app.resumeFileSize,
      resumeFileType: app.resumeFileType,
      interviews: (app.interviews || []).map((inv) => ({
        id: inv.id,
        title: inv.title,
        type: inv.type,
        scheduledAt: inv.scheduledAt.toISOString(),
        durationMinutes: inv.durationMinutes,
        meetingUrl: inv.meetingUrl,
        status: inv.status,
      })),
      offers: (app.offers || []).map((off) => ({
        id: off.id,
        positionTitle: off.positionTitle,
        salaryOffered: off.salaryOffered,
        currency: off.currency,
        salaryPeriod: off.salaryPeriod,
        startDate: off.startDate?.toISOString() || null,
        status: off.status,
      })),
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
