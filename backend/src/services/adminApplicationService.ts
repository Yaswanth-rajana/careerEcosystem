import { db } from '../db/client';
import {
  ApplicationAdminListDTO,
  ApplicationAdminDetailDTO,
  PaginatedAdminResult,
} from '../types/admin';

export interface ListAdminApplicationsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  jobId?: string;
  candidateId?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class AdminApplicationService {
  /**
   * Retrieves paginated job applications with candidate and job associations.
   */
  static async listApplications(
    params: ListAdminApplicationsParams = {}
  ): Promise<PaginatedAdminResult<ApplicationAdminListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.jobId) {
      where.jobId = params.jobId;
    }
    if (params.candidateId) {
      where.candidateId = params.candidateId;
    }

    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { candidate: { name: { contains: q, mode: 'insensitive' } } },
        { candidate: { email: { contains: q, mode: 'insensitive' } } },
        { job: { title: { contains: q, mode: 'insensitive' } } },
        { job: { company: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, applications] = await Promise.all([
      db.jobApplication.count({ where }),
      db.jobApplication.findMany({
        where,
        select: {
          id: true,
          status: true,
          createdAt: true,
          reviewedAt: true,
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const items: ApplicationAdminListDTO[] = applications.map((app) => ({
      id: app.id,
      candidateId: app.candidate.id,
      candidateName: app.candidate.name,
      candidateEmail: app.candidate.email,
      candidateAvatar: app.candidate.avatarUrl,
      jobId: app.job.id,
      jobTitle: app.job.title,
      company: app.job.company,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
      reviewedAt: app.reviewedAt?.toISOString() || null,
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
   * Retrieves full application details for admin inspection.
   */
  static async getApplicationDetail(applicationId: string): Promise<ApplicationAdminDetailDTO | null> {
    if (!applicationId) return null;

    const app = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    if (!app) return null;

    return {
      id: app.id,
      candidateId: app.candidate.id,
      candidateName: app.candidate.name,
      candidateEmail: app.candidate.email,
      candidateAvatar: app.candidate.avatarUrl,
      jobId: app.job.id,
      jobTitle: app.job.title,
      company: app.job.company,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
      reviewedAt: app.reviewedAt?.toISOString() || null,
      coverNote: app.coverNote,
      answers: app.answers,
      resumeUrl: app.resumeUrl,
      feedback: app.feedback,
    };
  }
}
