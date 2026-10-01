import { db } from '../../db/client';

export interface SearchRecruiterCandidatesParams {
  page?: number;
  limit?: number;
  q?: string;
  skill?: string;
  location?: string;
  candidateType?: string;
}

export class RecruiterCandidateService {
  /**
   * Discovers candidate profiles who have engaged with the platform.
   * Returns sanitized, lightweight candidate cards without sensitive PII.
   */
  static async searchCandidates(companyId: string, params: SearchRecruiterCandidatesParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
      role: 'CANDIDATE',
      isOnboarded: true,
      profile: { isNot: null },
    };

    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { profile: { headline: { contains: q, mode: 'insensitive' } } },
        { profile: { currentRole: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (params.location?.trim()) {
      where.profile = {
        ...where.profile,
        location: { contains: params.location.trim(), mode: 'insensitive' },
      };
    }

    if (params.candidateType && params.candidateType !== 'All') {
      where.profile = {
        ...where.profile,
        candidateType: params.candidateType,
      };
    }

    const [total, candidates] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          profile: {
            select: {
              headline: true,
              location: true,
              candidateType: true,
              totalExperience: true,
              userSkills: {
                take: 5,
                select: {
                  level: true,
                  verified: true,
                  skill: { select: { name: true } },
                },
              },
            },
          },
          jobApplications: {
            where: { job: { companyId } },
            select: {
              id: true,
              status: true,
              job: { select: { id: true, title: true } },
            },
            take: 1,
          },
        },
      }),
    ]);

    const items = candidates.map((c) => {
      const existingApplication = c.jobApplications?.[0] || null;
      return {
        id: c.id,
        name: c.name,
        avatarUrl: c.avatarUrl,
        headline: c.profile?.headline || null,
        location: c.profile?.location || null,
        candidateType: c.profile?.candidateType || null,
        totalExperience: c.profile?.totalExperience || null,
        topSkills: (c.profile?.userSkills || []).map((us) => us.skill.name),
        applicationStatus: existingApplication?.status || null,
        appliedJobTitle: existingApplication?.job?.title || null,
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
}
