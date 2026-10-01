import { db } from '../db/client';
import { JobCardDTO, formatSalary, ApplicationStatus } from '../types/jobs';

export class JobMatchingService {
  /**
   * Deterministic matching service for "For You" / "Recommended" opportunities.
   * Uses candidate's target role, user skills, work environment, and location.
   * Never calls LLM in the critical path.
   * Returns maximum 3-4 jobs with explicit deterministic match reasons.
   */
  static async getRecommendedJobs(
    userId?: string | null,
    limit: number = 3
  ): Promise<JobCardDTO[]> {
    const maxItems = Math.min(4, Math.max(1, limit));

    // If unauthenticated or no userId, return top featured/recent jobs
    if (!userId) {
      return this.getFallbackJobs(maxItems);
    }

    // 1. Fetch user's profile with career goal, preferences, and skills
    const profile = await db.profile.findUnique({
      where: { userId },
      include: {
        careerGoal: true,
        jobPreference: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!profile) {
      return this.getFallbackJobs(maxItems, userId);
    }

    const targetRole = profile.careerGoal?.targetRole?.toLowerCase().trim();
    const candidateSkills = profile.userSkills.map((us) => us.skill.name.toLowerCase());
    const preferredWorkMode = profile.jobPreference?.workEnvironment?.toLowerCase();
    const preferredLocation = profile.jobPreference?.preferredLocation?.toLowerCase().trim();

    // 2. Fetch active published jobs
    const activeJobs = await db.job.findMany({
      where: {
        status: 'PUBLISHED',
      },
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
      take: 60, // Candidate pool for deterministic scoring
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    if (activeJobs.length === 0) {
      return [];
    }

    // 3. Deterministic scoring
    const scoredJobs = activeJobs.map((job) => {
      let score = 0;
      const reasons: string[] = [];

      // Target role match
      const jobTitleLower = job.title.toLowerCase();
      if (targetRole && (jobTitleLower.includes(targetRole) || targetRole.includes(jobTitleLower))) {
        score += 40;
        reasons.push(`Target role: ${profile.careerGoal?.targetRole}`);
      }

      // Skill overlap
      const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
      const overlappingSkills = candidateSkills.filter((cs) => jobSkillsLower.includes(cs));
      if (overlappingSkills.length > 0) {
        score += Math.min(30, overlappingSkills.length * 10);
        reasons.push(
          `${overlappingSkills.length} matching skill${overlappingSkills.length > 1 ? 's' : ''}`
        );
      }

      // Work mode match
      if (preferredWorkMode && job.workMode.toLowerCase().includes(preferredWorkMode)) {
        score += 15;
      }

      // Location match
      if (preferredLocation && job.location.toLowerCase().includes(preferredLocation)) {
        score += 15;
      }

      // Bonus for featured
      if (job.featured) {
        score += 5;
      }

      return {
        job,
        score,
        reason: reasons.length > 0 ? reasons.join(' • ') : 'Aligned with your career track',
      };
    });

    // Sort by score descending
    scoredJobs.sort((a, b) => b.score - a.score);
    const topScored = scoredJobs.slice(0, maxItems);

    // 4. Resolve saved & application status
    const jobIds = topScored.map((s) => s.job.id);
    const [saved, apps] = await Promise.all([
      db.savedJob.findMany({
        where: { userId, jobId: { in: jobIds } },
        select: { jobId: true },
      }),
      db.jobApplication.findMany({
        where: { candidateId: userId, jobId: { in: jobIds } },
        select: { jobId: true, status: true },
      }),
    ]);

    const savedSet = new Set(saved.map((s) => s.jobId));
    const appsMap = new Map<string, ApplicationStatus>();
    apps.forEach((a) => appsMap.set(a.jobId, a.status as ApplicationStatus));

    return topScored.map(({ job, reason }) => {
      const salaryFormatted = formatSalary(
        job.salaryMin,
        job.salaryMax,
        job.salaryCurrency || 'INR',
        job.salaryPeriod || 'YEAR'
      );
      const appStatus = appsMap.get(job.id) || null;

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
        isSaved: savedSet.has(job.id),
        hasApplied: Boolean(appStatus),
        applicationStatus: appStatus,
        jobVerified: job.jobVerified,
        companyVerified: job.companyVerified,
        featured: job.featured,
        matchReason: reason,
      };
    });
  }

  /**
   * Fallback recommended jobs when no user profile is available
   */
  private static async getFallbackJobs(
    limit: number,
    userId?: string | null
  ): Promise<JobCardDTO[]> {
    const rawJobs = await db.job.findMany({
      where: { status: 'PUBLISHED' },
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
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    });

    let savedSet = new Set<string>();
    let appsMap = new Map<string, ApplicationStatus>();

    if (userId && rawJobs.length > 0) {
      const ids = rawJobs.map((j) => j.id);
      const [saved, apps] = await Promise.all([
        db.savedJob.findMany({ where: { userId, jobId: { in: ids } }, select: { jobId: true } }),
        db.jobApplication.findMany({
          where: { candidateId: userId, jobId: { in: ids } },
          select: { jobId: true, status: true },
        }),
      ]);
      savedSet = new Set(saved.map((s) => s.jobId));
      apps.forEach((a) => appsMap.set(a.jobId, a.status as ApplicationStatus));
    }

    return rawJobs.map((job) => {
      const salaryFormatted = formatSalary(
        job.salaryMin,
        job.salaryMax,
        job.salaryCurrency || 'INR',
        job.salaryPeriod || 'YEAR'
      );
      const appStatus = appsMap.get(job.id) || null;

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
        isSaved: savedSet.has(job.id),
        hasApplied: Boolean(appStatus),
        applicationStatus: appStatus,
        jobVerified: job.jobVerified,
        companyVerified: job.companyVerified,
        featured: job.featured,
        matchReason: job.featured ? 'Featured Opportunity' : 'Recently Posted',
      };
    });
  }
}
