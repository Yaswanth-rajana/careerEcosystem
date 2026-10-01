import { db } from '../../db/client';
import {
  RecruiterJobListDTO,
  RecruiterJobDetailDTO,
  AuthenticatedRecruiter,
} from '../../types/recruiter';
import { RecruiterJobCreateSchema, RecruiterJobUpdateSchema } from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { z } from 'zod';

export interface ListRecruiterJobsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  workMode?: string;
  employmentType?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class RecruiterJobService {
  /**
   * Retrieves paginated job postings strictly scoped to the recruiter's company.
   */
  static async listJobs(companyId: string, params: ListRecruiterJobsParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

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
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
          interviews: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    const items: RecruiterJobListDTO[] = jobs.map((job) => {
      const apps = job.applications || [];
      const shortlistedCount = apps.filter((a) => a.status === 'SHORTLISTED').length;

      return {
        id: job.id,
        title: job.title,
        status: job.status as any,
        workMode: job.workMode,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        location: job.location,
        skills: job.skills,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        applicationsCount: apps.length,
        shortlistedCount,
        interviewsCount: (job.interviews || []).length,
        publishedAt: job.publishedAt?.toISOString() || null,
        createdAt: job.createdAt.toISOString(),
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
   * Retrieves full job details, ensuring company ownership.
   */
  static async getJobDetail(jobId: string, companyId: string): Promise<RecruiterJobDetailDTO> {
    const job = await db.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
      include: {
        applications: {
          select: { id: true },
        },
      },
    });

    if (!job) {
      throw new Error(`Job not found or access denied.`);
    }

    return {
      id: job.id,
      title: job.title,
      status: job.status as any,
      workMode: job.workMode,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      location: job.location,
      skills: job.skills,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryPeriod: job.salaryPeriod,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      niceToHave: job.niceToHave,
      benefits: job.benefits,
      publishedAt: job.publishedAt?.toISOString() || null,
      expiresAt: job.expiresAt?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      applicationsCount: (job.applications || []).length,
      companyId: job.companyId!,
      createdById: job.createdById,
    };
  }

  /**
   * Creates a new job posting scoped to the recruiter's company.
   */
  static async createJob(data: z.infer<typeof RecruiterJobCreateSchema>, auth: AuthenticatedRecruiter) {
    const validated = RecruiterJobCreateSchema.parse(data);

    const isPublished = validated.status === 'PUBLISHED';

    const job = await db.job.create({
      data: {
        title: validated.title,
        company: auth.company.name,
        companyLogo: auth.company.logoUrl || null,
        companyId: auth.company.id,
        createdById: auth.user.id,
        location: validated.location,
        workMode: validated.workMode,
        employmentType: validated.employmentType,
        experienceLevel: validated.experienceLevel,
        skills: validated.skills,
        salaryMin: validated.salaryMin || null,
        salaryMax: validated.salaryMax || null,
        salaryCurrency: validated.salaryCurrency || 'INR',
        salaryPeriod: validated.salaryPeriod || 'YEAR',
        description: validated.description,
        responsibilities: validated.responsibilities,
        requirements: validated.requirements,
        niceToHave: validated.niceToHave,
        benefits: validated.benefits,
        status: validated.status,
        jobVerified: auth.company.verified,
        companyVerified: auth.company.verified,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: isPublished ? 'RECRUITER_JOB_PUBLISHED' : 'RECRUITER_JOB_DRAFT_CREATED',
      resourceType: 'JOB',
      resourceId: job.id,
      details: { title: job.title, companyId: auth.company.id, status: job.status },
    });

    return this.getJobDetail(job.id, auth.company.id);
  }

  /**
   * Updates an existing job posting with ownership verification.
   */
  static async updateJob(jobId: string, data: z.infer<typeof RecruiterJobUpdateSchema>, auth: AuthenticatedRecruiter) {
    const validated = RecruiterJobUpdateSchema.parse(data);

    const existing = await db.job.findFirst({
      where: { id: jobId, companyId: auth.company.id },
    });

    if (!existing) {
      throw new Error('Job not found or access denied.');
    }

    const wasDraft = existing.status === 'DRAFT';
    const isNowPublished = validated.status === 'PUBLISHED';

    const updated = await db.job.update({
      where: { id: jobId },
      data: {
        ...(validated.title !== undefined ? { title: validated.title } : {}),
        ...(validated.location !== undefined ? { location: validated.location } : {}),
        ...(validated.workMode !== undefined ? { workMode: validated.workMode } : {}),
        ...(validated.employmentType !== undefined ? { employmentType: validated.employmentType } : {}),
        ...(validated.experienceLevel !== undefined ? { experienceLevel: validated.experienceLevel } : {}),
        ...(validated.skills !== undefined ? { skills: validated.skills } : {}),
        ...(validated.salaryMin !== undefined ? { salaryMin: validated.salaryMin } : {}),
        ...(validated.salaryMax !== undefined ? { salaryMax: validated.salaryMax } : {}),
        ...(validated.salaryCurrency !== undefined ? { salaryCurrency: validated.salaryCurrency } : {}),
        ...(validated.salaryPeriod !== undefined ? { salaryPeriod: validated.salaryPeriod } : {}),
        ...(validated.description !== undefined ? { description: validated.description } : {}),
        ...(validated.responsibilities !== undefined ? { responsibilities: validated.responsibilities } : {}),
        ...(validated.requirements !== undefined ? { requirements: validated.requirements } : {}),
        ...(validated.niceToHave !== undefined ? { niceToHave: validated.niceToHave } : {}),
        ...(validated.benefits !== undefined ? { benefits: validated.benefits } : {}),
        ...(validated.status !== undefined ? { status: validated.status } : {}),
        ...(wasDraft && isNowPublished ? { publishedAt: new Date() } : {}),
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_JOB_UPDATED',
      resourceType: 'JOB',
      resourceId: updated.id,
      details: { title: updated.title, newStatus: updated.status },
    });

    return this.getJobDetail(updated.id, auth.company.id);
  }

  /**
   * Clones a job posting as a DRAFT.
   */
  static async duplicateJob(jobId: string, auth: AuthenticatedRecruiter) {
    const original = await db.job.findFirst({
      where: { id: jobId, companyId: auth.company.id },
    });

    if (!original) {
      throw new Error('Original job not found or access denied.');
    }

    const cloned = await db.job.create({
      data: {
        title: `${original.title} (Copy)`,
        company: original.company,
        companyLogo: original.companyLogo,
        companyId: auth.company.id,
        createdById: auth.user.id,
        location: original.location,
        workMode: original.workMode,
        employmentType: original.employmentType,
        experienceLevel: original.experienceLevel,
        skills: original.skills,
        salaryMin: original.salaryMin,
        salaryMax: original.salaryMax,
        salaryCurrency: original.salaryCurrency,
        salaryPeriod: original.salaryPeriod,
        description: original.description,
        responsibilities: original.responsibilities,
        requirements: original.requirements,
        niceToHave: original.niceToHave,
        benefits: original.benefits,
        status: 'DRAFT',
        jobVerified: false,
        companyVerified: original.companyVerified,
        publishedAt: null,
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_JOB_DUPLICATED',
      resourceType: 'JOB',
      resourceId: cloned.id,
      details: { originalJobId: original.id, newJobId: cloned.id },
    });

    return this.getJobDetail(cloned.id, auth.company.id);
  }

  /**
   * Pauses or closes a job.
   */
  static async changeJobStatus(jobId: string, newStatus: 'PUBLISHED' | 'PAUSED' | 'CLOSED', auth: AuthenticatedRecruiter) {
    return this.updateJob(jobId, { status: newStatus }, auth);
  }
}
