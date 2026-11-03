import { db } from '../../db/client';
import { AuthenticatedRecruiter } from '../../types/recruiter';
import { RecruiterRbacService } from './recruiterRbacService';
import { RecruiterAuthError } from './recruiterAuthService';

export interface SearchRecruiterCandidatesParams {
  page?: number;
  limit?: number;
  q?: string;
  skill?: string;
  location?: string;
  candidateType?: string;
  onlyApplicants?: boolean;
}

export class RecruiterCandidateService {
  /**
   * Discovers candidate profiles who have engaged with the platform.
   * Returns sanitized, lightweight candidate cards without sensitive PII,
   * while connecting any existing job applications for the recruiter's company.
   */
  static async searchCandidates(
    companyId: string,
    params: SearchRecruiterCandidatesParams = {},
    auth?: AuthenticatedRecruiter
  ) {
    if (auth) {
      RecruiterRbacService.assertActiveMembership(auth);
      const canViewAll = auth.permissions.includes('candidates:view_all');
      const canViewAssigned = auth.permissions.includes('candidates:view_assigned');

      if (!canViewAll && !canViewAssigned) {
        throw new RecruiterAuthError('Forbidden. You do not have permission to view candidates.', 403);
      }
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
      role: 'CANDIDATE',
      isOnboarded: true,
      profile: { isNot: null },
    };

    if (auth && !auth.permissions.includes('candidates:view_all')) {
      if (auth.companyRole === 'HIRING_MANAGER' && auth.membership.assignedJobIds.length > 0) {
        where.jobApplications = {
          some: {
            jobId: { in: auth.membership.assignedJobIds },
            job: { companyId },
          },
        };
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
          select: { candidateId: true },
        });
        const assignedCandidateIds = assignedInterviews.map((i) => i.candidateId);
        where.id = { in: assignedCandidateIds };
      }
    }

    if (params.onlyApplicants) {
      where.jobApplications = {
        some: {
          job: { companyId },
        },
      };
    }

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

    if (params.skill?.trim()) {
      where.profile = {
        ...where.profile,
        userSkills: {
          some: {
            skill: {
              name: { contains: params.skill.trim(), mode: 'insensitive' },
            },
          },
        },
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
                take: 8,
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
              createdAt: true,
              job: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const items = candidates.map((c) => {
      const existingApplication = c.jobApplications?.[0] || null;
      const skills = (c.profile?.userSkills || []).map((us) => us.skill.name);
      return {
        id: c.id,
        name: c.name,
        avatarUrl: c.avatarUrl,
        headline: c.profile?.headline || null,
        location: c.profile?.location || null,
        candidateType: c.profile?.candidateType || null,
        totalExperience: c.profile?.totalExperience || null,
        skills,
        topSkills: skills,
        applicationId: existingApplication?.id || null,
        applicationStatus: existingApplication?.status || null,
        appliedJobTitle: existingApplication?.job?.title || null,
        appliedJobId: existingApplication?.job?.id || null,
        appliedAt: existingApplication?.createdAt?.toISOString() || null,
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
