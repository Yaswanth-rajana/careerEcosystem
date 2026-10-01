import { db } from '../db/client';
import {
  JobCardDTO,
  PaginatedResult,
  formatSalary,
  ApplicationStatus,
} from '../types/jobs';

export class SavedJobService {
  /**
   * Idempotently saves a job for a user.
   */
  static async saveJob(
    userId: string,
    jobId: string
  ): Promise<{ success: boolean; isSaved: boolean }> {
    if (!userId || !jobId) {
      throw new Error('User ID and Job ID are required');
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Upsert ensures idempotency
    await db.savedJob.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      create: {
        userId,
        jobId,
      },
      update: {},
    });

    return { success: true, isSaved: true };
  }

  /**
   * Idempotently removes a saved job for a user.
   */
  static async unsaveJob(
    userId: string,
    jobId: string
  ): Promise<{ success: boolean; isSaved: boolean }> {
    if (!userId || !jobId) {
      throw new Error('User ID and Job ID are required');
    }

    await db.savedJob.deleteMany({
      where: {
        userId,
        jobId,
      },
    });

    return { success: true, isSaved: false };
  }

  /**
   * Checks if a job is saved by the user.
   */
  static async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    if (!userId || !jobId) return false;
    const found = await db.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      select: { id: true },
    });
    return Boolean(found);
  }

  /**
   * Retrieves paginated list of jobs saved by the user.
   */
  static async getSavedJobs(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<JobCardDTO>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [total, savedRecords] = await Promise.all([
      db.savedJob.count({
        where: { userId },
      }),
      db.savedJob.findMany({
        where: { userId },
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
              skills: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              salaryPeriod: true,
              publishedAt: true,
              createdAt: true,
              jobVerified: true,
              companyVerified: true,
              featured: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit,
      }),
    ]);

    const jobIds = savedRecords.map((r) => r.job.id);
    const apps = await db.jobApplication.findMany({
      where: {
        candidateId: userId,
        jobId: { in: jobIds },
      },
      select: { jobId: true, status: true },
    });

    const applicationsMap = new Map<string, ApplicationStatus>();
    apps.forEach((a) => applicationsMap.set(a.jobId, a.status as ApplicationStatus));

    const items: JobCardDTO[] = savedRecords.map((record) => {
      const job = record.job;
      const salaryFormatted = formatSalary(
        job.salaryMin,
        job.salaryMax,
        job.salaryCurrency || 'INR',
        job.salaryPeriod || 'YEAR'
      );
      const appStatus = applicationsMap.get(job.id) || null;

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo || null,
        location: job.location,
        workMode: job.workMode,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        skills: job.skills,
        salary: salaryFormatted
          ? {
              min: job.salaryMin,
              max: job.salaryMax,
              currency: job.salaryCurrency || 'INR',
              period: job.salaryPeriod || 'YEAR',
              formatted: salaryFormatted,
            }
          : null,
        postedAt: (job.publishedAt || job.createdAt).toISOString(),
        isSaved: true,
        hasApplied: Boolean(appStatus),
        applicationStatus: appStatus,
        jobVerified: job.jobVerified,
        companyVerified: job.companyVerified,
        featured: job.featured,
      };
    });

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
