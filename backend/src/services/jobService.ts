import { db } from '../db/client';
import {
  JobDetailDTO,
  formatSalary,
  ApplicationStatus,
} from '../types/jobs';
import { CreateJobSchema } from '../validations/jobSchemas';

export class JobService {
  /**
   * Retrieves a single job by ID.
   * If viewed by a candidate, only PUBLISHED jobs are accessible.
   * Returns complete JobDetailDTO with full description, responsibilities, requirements, and user application status.
   */
  static async getJobById(
    jobId: string,
    currentUserId?: string | null
  ): Promise<JobDetailDTO | null> {
    if (!jobId || typeof jobId !== 'string') return null;

    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) return null;

    // Candidates cannot see non-published jobs
    if (job.status !== 'PUBLISHED') {
      return null;
    }

    let isSaved = false;
    let application: { id: string; status: string } | null = null;

    if (currentUserId) {
      const [saved, app] = await Promise.all([
        db.savedJob.findUnique({
          where: {
            userId_jobId: {
              userId: currentUserId,
              jobId: job.id,
            },
          },
          select: { id: true },
        }),
        db.jobApplication.findUnique({
          where: {
            candidateId_jobId: {
              candidateId: currentUserId,
              jobId: job.id,
            },
          },
          select: { id: true, status: true },
        }),
      ]);

      isSaved = Boolean(saved);
      application = app ? { id: app.id, status: app.status } : null;
    }

    const salaryFormatted = formatSalary(
      job.salaryMin,
      job.salaryMax,
      job.salaryCurrency || 'INR',
      job.salaryPeriod || 'YEAR'
    );

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo || null,
      companyId: job.companyId || null,
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
      description: job.description,
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      niceToHave: job.niceToHave || [],
      benefits: job.benefits || [],
      isSaved,
      hasApplied: Boolean(application),
      applicationId: application?.id || null,
      applicationStatus: (application?.status as ApplicationStatus) || null,
      jobVerified: job.jobVerified,
      companyVerified: job.companyVerified,
      status: job.status,
    };
  }

  /**
   * Creates a new job posting.
   */
  static async createJob(input: any): Promise<any> {
    const validated = CreateJobSchema.parse(input);

    const created = await db.job.create({
      data: {
        title: validated.title,
        company: validated.company,
        companyLogo: validated.companyLogo,
        location: validated.location,
        workMode: validated.workMode,
        employmentType: validated.employmentType,
        experienceLevel: validated.experienceLevel,
        skills: validated.skills,
        salaryMin: validated.salaryMin,
        salaryMax: validated.salaryMax,
        salaryCurrency: validated.salaryCurrency,
        salaryPeriod: validated.salaryPeriod,
        description: validated.description,
        responsibilities: validated.responsibilities,
        requirements: validated.requirements,
        niceToHave: validated.niceToHave,
        benefits: validated.benefits,
        status: validated.status,
        jobVerified: validated.jobVerified,
        companyVerified: validated.companyVerified,
        featured: validated.featured,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
      },
    });

    return created;
  }

  /**
   * Publishes a draft job.
   */
  static async publishJob(jobId: string): Promise<any> {
    return await db.job.update({
      where: { id: jobId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }
}
