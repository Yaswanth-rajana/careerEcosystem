import { db } from '../db/client';
import {
  JobSearchParams,
  JobCardDTO,
  PaginatedResult,
  formatSalary,
  ApplicationStatus,
} from '../types/jobs';

export class JobSearchService {
  /**
   * Performs server-side search, filtering, sorting, and pagination.
   * Only returns active PUBLISHED jobs for candidate discovery.
   * Projection strictly excludes heavy text fields (description, requirements, responsibilities).
   */
  static async searchJobs(
    params: JobSearchParams,
    currentUserId?: string | null
  ): Promise<PaginatedResult<JobCardDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    // Base filter: Only PUBLISHED jobs
    const where: any = {
      status: 'PUBLISHED',
    };

    // Filter by postedWithin date
    if (params.postedWithin) {
      const now = new Date();
      let threshold = new Date();
      if (params.postedWithin === '24h') {
        threshold.setHours(now.getHours() - 24);
      } else if (params.postedWithin === '3d') {
        threshold.setDate(now.getDate() - 3);
      } else if (params.postedWithin === '7d') {
        threshold.setDate(now.getDate() - 7);
      } else if (params.postedWithin === '30d') {
        threshold.setDate(now.getDate() - 30);
      }
      where.publishedAt = { gte: threshold };
    }

    // Filter by location
    if (params.location && params.location.trim()) {
      where.location = {
        contains: params.location.trim(),
        mode: 'insensitive',
      };
    }

    // Filter by workMode (single or array)
    if (params.workMode) {
      if (Array.isArray(params.workMode) && params.workMode.length > 0) {
        where.workMode = { in: params.workMode };
      } else if (typeof params.workMode === 'string') {
        where.workMode = params.workMode;
      }
    }

    // Filter by employmentType
    if (params.employmentType) {
      if (Array.isArray(params.employmentType) && params.employmentType.length > 0) {
        where.employmentType = { in: params.employmentType };
      } else if (typeof params.employmentType === 'string') {
        where.employmentType = params.employmentType;
      }
    }

    // Filter by experienceLevel
    if (params.experienceLevel) {
      if (Array.isArray(params.experienceLevel) && params.experienceLevel.length > 0) {
        where.experienceLevel = { in: params.experienceLevel };
      } else if (typeof params.experienceLevel === 'string') {
        where.experienceLevel = params.experienceLevel;
      }
    }

    // Filter by skills (hasSome)
    if (params.skills) {
      const skillsArray = Array.isArray(params.skills)
        ? params.skills
        : [params.skills];
      if (skillsArray.length > 0) {
        where.skills = {
          hasSome: skillsArray,
        };
      }
    }

    // Filter by salary range
    if (params.salaryMin !== undefined && params.salaryMin > 0) {
      where.salaryMax = { gte: params.salaryMin };
    }
    if (params.salaryMax !== undefined && params.salaryMax > 0) {
      where.salaryMin = { lte: params.salaryMax };
    }

    // Full-text / keyword search on query term
    if (params.q && params.q.trim()) {
      const term = params.q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { skills: { has: term } },
      ];
    }

    // Sorting: Newest or Relevance
    // In MongoDB Prisma, newest is publishedAt desc
    const orderBy: any = [{ publishedAt: 'desc' }, { createdAt: 'desc' }];

    // Parallel fetch: total count + paginated items
    const [total, rawJobs] = await Promise.all([
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
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Batch resolve saved state and application state for current user
    let savedJobIds = new Set<string>();
    let applicationsMap = new Map<string, ApplicationStatus>();

    if (currentUserId && rawJobs.length > 0) {
      const jobIds = rawJobs.map((j) => j.id);

      const [saved, apps] = await Promise.all([
        db.savedJob.findMany({
          where: {
            userId: currentUserId,
            jobId: { in: jobIds },
          },
          select: { jobId: true },
        }),
        db.jobApplication.findMany({
          where: {
            candidateId: currentUserId,
            jobId: { in: jobIds },
          },
          select: { jobId: true, status: true },
        }),
      ]);

      savedJobIds = new Set(saved.map((s) => s.jobId));
      apps.forEach((a) => applicationsMap.set(a.jobId, a.status as ApplicationStatus));
    }

    // Map to clean JobCardDTOs
    const items: JobCardDTO[] = rawJobs.map((job) => {
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
        isSaved: savedJobIds.has(job.id),
        hasApplied: Boolean(appStatus),
        applicationStatus: appStatus,
        jobVerified: job.jobVerified,
        companyVerified: job.companyVerified,
        featured: job.featured,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
