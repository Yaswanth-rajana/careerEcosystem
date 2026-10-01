import { db } from '../../db/client';
import { RecruiterDashboardDTO } from '../../types/recruiter';
import { ApplicationStatus } from '../../types/jobs';

export class RecruiterDashboardService {
  /**
   * Retrieves operational dashboard metrics for a specific company tenant.
   */
  static async getDashboardMetrics(companyId: string): Promise<RecruiterDashboardDTO> {
    const now = new Date();

    const [
      activeJobsCount,
      allApplications,
      upcomingInterviewsList,
      recentJobsList,
      activeOffersCount,
    ] = await Promise.all([
      db.job.count({
        where: { companyId, status: 'PUBLISHED' },
      }),
      db.jobApplication.findMany({
        where: { job: { companyId } },
        select: {
          id: true,
          status: true,
          createdAt: true,
          candidate: {
            select: { name: true, email: true },
          },
          job: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.interview.findMany({
        where: {
          companyId,
          status: 'SCHEDULED',
          scheduledAt: { gte: now },
        },
        take: 5,
        orderBy: { scheduledAt: 'asc' },
        include: {
          candidate: { select: { name: true } },
          job: { select: { title: true } },
        },
      }),
      db.job.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          applications: { select: { id: true } },
        },
      }),
      db.offer.count({
        where: { companyId, status: 'SENT' },
      }),
    ]);

    // Compute pipeline distribution
    const pipelineDistribution: Record<ApplicationStatus, number> = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      TASK_PENDING: 0,
      TASK_SUBMITTED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    let candidatesToReview = 0;
    let shortlisted = 0;

    for (const app of allApplications) {
      const st = app.status as ApplicationStatus;
      if (pipelineDistribution[st] !== undefined) {
        pipelineDistribution[st]++;
      }
      if (st === 'APPLIED' || st === 'UNDER_REVIEW') {
        candidatesToReview++;
      }
      if (st === 'SHORTLISTED') {
        shortlisted++;
      }
    }

    const recentApplications = allApplications.slice(0, 5).map((app) => ({
      id: app.id,
      candidateName: app.candidate.name,
      candidateEmail: app.candidate.email,
      jobTitle: app.job.title,
      appliedAt: app.createdAt.toISOString(),
      status: app.status as ApplicationStatus,
    }));

    const upcomingInterviews = upcomingInterviewsList.map((inv) => ({
      id: inv.id,
      candidateName: inv.candidate.name,
      jobTitle: inv.job.title,
      type: inv.type,
      scheduledAt: inv.scheduledAt.toISOString(),
      meetingUrl: inv.meetingUrl,
    }));

    const recentJobs = recentJobsList.map((j) => ({
      id: j.id,
      title: j.title,
      status: j.status as any,
      workMode: j.workMode,
      applicationsCount: (j.applications || []).length,
      createdAt: j.createdAt.toISOString(),
    }));

    return {
      summary: {
        activeJobs: activeJobsCount,
        totalApplications: allApplications.length,
        candidatesToReview,
        shortlisted,
        upcomingInterviews: upcomingInterviewsList.length,
        activeOffers: activeOffersCount,
      },
      actionRequired: {
        recentApplications,
        upcomingInterviews,
      },
      recentJobs,
      pipelineDistribution,
    };
  }
}
