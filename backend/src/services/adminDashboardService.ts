import { db } from '../db/client';
import { AdminDashboardDTO } from '../types/admin';
import { AuditService } from './auditService';

export class AdminDashboardService {
  /**
   * Generates lightweight admin dashboard metrics using parallel database count queries.
   * Avoids scanning entire collections or executing expensive aggregations.
   */
  static async getDashboardMetrics(): Promise<AdminDashboardDTO> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Parallel aggregate count queries
    const [
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalMentors,
      activeMentors,
      pendingMentors,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalJobs,
      publishedJobs,
      pendingJobs,
      totalApplications,
      pendingApplications,
      recentActivityData,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),

      db.mentor.count(),
      db.mentor.count({ where: { status: 'APPROVED' } }),
      db.mentorApplication.count({ where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } } }),

      db.course.count(),
      db.course.count({ where: { status: 'PUBLISHED' } }),
      db.course.count({ where: { status: { in: ['DRAFT', 'REVIEW'] } } }),

      db.job.count(),
      db.job.count({ where: { status: 'PUBLISHED' } }),
      db.job.count({ where: { status: { in: ['DRAFT', 'PENDING_REVIEW'] } } }),

      db.jobApplication.count(),
      db.jobApplication.count({ where: { status: 'APPLIED' } }),

      AuditService.listLogs({ page: 1, limit: 8 }),
    ]);

    return {
      metrics: {
        students: {
          total: totalUsers,
          active: activeUsers,
          newThisWeek: newUsersThisWeek,
        },
        mentors: {
          total: totalMentors,
          active: activeMentors,
          pending: pendingMentors,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
        },
        jobs: {
          total: totalJobs,
          published: publishedJobs,
          pendingReview: pendingJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
        },
      },
      pendingApprovals: {
        mentorApplications: pendingMentors,
        jobReviews: pendingJobs,
        courseReviews: draftCourses,
      },
      recentActivity: recentActivityData.items,
    };
  }
}
