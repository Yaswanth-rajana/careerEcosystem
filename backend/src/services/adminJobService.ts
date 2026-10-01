import { db } from '../db/client';
import {
  JobAdminListDTO,
  JobAdminDetailDTO,
  PaginatedAdminResult,
} from '../types/admin';
import { AdminJobModerateSchema } from '../validations/adminSchemas';
import { AuditService } from './auditService';
import { AuthenticatedAdmin } from './adminAuthService';

export interface ListAdminJobsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  workMode?: string;
  employmentType?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class AdminJobService {
  /**
   * Retrieves paginated job postings for admin moderation.
   */
  static async listJobs(params: ListAdminJobsParams = {}): Promise<PaginatedAdminResult<JobAdminListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.workMode && params.workMode !== 'All') {
      where.workMode = params.workMode;
    }
    if (params.employmentType && params.employmentType !== 'All') {
      where.employmentType = params.employmentType;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { skills: { has: q } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, jobs] = await Promise.all([
      db.job.count({ where }),
      db.job.findMany({
        where,
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
          featured: true,
          jobVerified: true,
          companyVerified: true,
          publishedAt: true,
          createdAt: true,
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const items: JobAdminListDTO[] = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      companyLogo: j.companyLogo,
      location: j.location,
      workMode: j.workMode,
      employmentType: j.employmentType,
      experienceLevel: j.experienceLevel,
      status: j.status,
      featured: j.featured,
      jobVerified: j.jobVerified,
      companyVerified: j.companyVerified,
      publishedAt: j.publishedAt?.toISOString() || null,
      createdAt: j.createdAt.toISOString(),
      applicationsCount: j._count.applications,
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
   * Retrieves full job details for moderation.
   */
  static async getJobDetail(jobId: string): Promise<JobAdminDetailDTO | null> {
    if (!jobId) return null;

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) return null;

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      location: job.location,
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      status: job.status,
      featured: job.featured,
      jobVerified: job.jobVerified,
      companyVerified: job.companyVerified,
      publishedAt: job.publishedAt?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
      applicationsCount: job._count.applications,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryPeriod: job.salaryPeriod,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      niceToHave: job.niceToHave,
      benefits: job.benefits,
      skills: job.skills,
      expiresAt: job.expiresAt?.toISOString() || null,
    };
  }

  /**
   * Moderates a job: changes status, verified flags, or featured status with audit.
   */
  static async moderateJob(jobId: string, input: any, actor: AuthenticatedAdmin): Promise<JobAdminDetailDTO> {
    const validated = AdminJobModerateSchema.parse(input);

    const existing = await db.job.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    const updated = await db.job.update({
      where: { id: jobId },
      data: {
        status: validated.status,
        ...(validated.featured !== undefined ? { featured: validated.featured } : {}),
        ...(validated.jobVerified !== undefined ? { jobVerified: validated.jobVerified } : {}),
        ...(validated.companyVerified !== undefined ? { companyVerified: validated.companyVerified } : {}),
        ...(validated.status === 'PUBLISHED' && !existing.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: `JOB_MODERATED_${validated.status}`,
      resourceType: 'JOB',
      resourceId: jobId,
      details: {
        jobTitle: existing.title,
        company: existing.company,
        previousStatus: existing.status,
        newStatus: validated.status,
        reason: validated.reason,
      },
    });

    return (await this.getJobDetail(jobId))!;
  }
}
