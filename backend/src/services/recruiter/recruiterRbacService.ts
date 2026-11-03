import { db } from '../../db/client';
import {
  AuthenticatedRecruiter,
  RecruiterRole,
  RecruiterPermission,
} from '../../types/recruiter';
import { RecruiterAuthError } from './recruiterAuthService';

export const ROLE_PERMISSIONS: Record<RecruiterRole, RecruiterPermission[]> = {
  COMPANY_ADMIN: [
    'team:view',
    'team:invite',
    'team:manage_roles',
    'team:remove_member',
    'company:view',
    'company:manage',
    'jobs:view',
    'jobs:create',
    'jobs:edit',
    'jobs:publish',
    'jobs:close',
    'applications:view_all',
    'applications:view_assigned',
    'candidates:view_all',
    'candidates:view_assigned',
    'pipeline:transition',
    'interviews:view_all',
    'interviews:view_assigned',
    'interviews:schedule',
    'interviews:assign',
    'interviews:feedback_technical',
    'interviews:feedback_hr',
    'offers:manage',
    'offers:view',
    'assessments:view',
    'assessments:manage',
    'reports:view',
    'dashboard:view',
  ],
  RECRUITER: [
    'team:view',
    'company:view',
    'jobs:view',
    'jobs:create',
    'jobs:edit',
    'jobs:publish',
    'jobs:close',
    'applications:view_all',
    'applications:view_assigned',
    'candidates:view_all',
    'candidates:view_assigned',
    'pipeline:transition',
    'interviews:view_all',
    'interviews:view_assigned',
    'interviews:schedule',
    'interviews:assign',
    'interviews:feedback_technical',
    'interviews:feedback_hr',
    'offers:view',
    'assessments:view',
    'assessments:manage',
    'reports:view',
    'dashboard:view',
  ],
  TECHNICAL_INTERVIEWER: [
    'interviews:view_assigned',
    'interviews:feedback_technical',
    'candidates:view_assigned',
    'applications:view_assigned',
    'dashboard:view',
  ],
  HR_INTERVIEWER: [
    'interviews:view_assigned',
    'interviews:feedback_hr',
    'candidates:view_assigned',
    'applications:view_assigned',
    'dashboard:view',
  ],
  INTERVIEW_COORDINATOR: [
    'interviews:view_all',
    'interviews:schedule',
    'interviews:assign',
    'candidates:view_all',
    'applications:view_all',
    'jobs:view',
    'dashboard:view',
  ],
  HIRING_MANAGER: [
    'jobs:view',
    'applications:view_assigned',
    'candidates:view_assigned',
    'pipeline:transition',
    'interviews:view_assigned',
    'interviews:feedback_hr',
    'interviews:feedback_technical',
    'offers:view',
    'offers:manage',
    'reports:view',
    'dashboard:view',
  ],
};

export class RecruiterRbacService {
  /**
   * Normalizes raw role strings (including legacy 'INTERVIEWER') to canonical RecruiterRole.
   */
  static normalizeRole(rawRole?: string | null): RecruiterRole {
    if (!rawRole) return 'RECRUITER';
    const upper = rawRole.toUpperCase();
    if (upper === 'COMPANY_ADMIN') return 'COMPANY_ADMIN';
    if (upper === 'TECHNICAL_INTERVIEWER') return 'TECHNICAL_INTERVIEWER';
    if (upper === 'HR_INTERVIEWER') return 'HR_INTERVIEWER';
    if (upper === 'INTERVIEW_COORDINATOR') return 'INTERVIEW_COORDINATOR';
    if (upper === 'HIRING_MANAGER') return 'HIRING_MANAGER';
    if (upper === 'INTERVIEWER') return 'TECHNICAL_INTERVIEWER';
    return 'RECRUITER';
  }

  /**
   * Returns list of permissions granted to a given role.
   */
  static getRolePermissions(role: RecruiterRole): RecruiterPermission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Checks whether a role or authenticated recruiter possesses a specific permission.
   */
  static hasPermission(target: RecruiterRole | AuthenticatedRecruiter, permission: RecruiterPermission): boolean {
    const role = typeof target === 'string' ? target : target.companyRole;
    const list = this.getRolePermissions(role);
    return list.includes(permission);
  }

  /**
   * Asserts that the authenticated recruiter belongs to an active membership and has permission.
   */
  static assertPermission(auth: AuthenticatedRecruiter, permission: RecruiterPermission): void {
    this.assertActiveMembership(auth);

    if (!auth.permissions.includes(permission)) {
      throw new RecruiterAuthError(
        `Forbidden. Your role (${auth.companyRole}) lacks the required '${permission}' permission.`,
        403
      );
    }
  }

  /**
   * Verifies that the recruiter's company membership is ACTIVE.
   */
  static assertActiveMembership(auth: AuthenticatedRecruiter): void {
    if (auth.membership.status !== 'ACTIVE') {
      throw new RecruiterAuthError(
        `Access denied. Your company membership is currently ${auth.membership.status.toLowerCase()}.`,
        403
      );
    }
  }

  /**
   * Checks job access scoped to company and optional hiring manager assignment.
   */
  static async assertJobAccess(auth: AuthenticatedRecruiter, jobId: string) {
    this.assertActiveMembership(auth);

    const job = await db.job.findFirst({
      where: { id: jobId, companyId: auth.company.id },
    });

    if (!job) {
      throw new RecruiterAuthError('Job not found or access denied.', 404);
    }

    // Hiring Managers can only access assigned jobs if assignedJobIds is specified
    if (
      auth.companyRole === 'HIRING_MANAGER' &&
      auth.membership.assignedJobIds.length > 0 &&
      !auth.membership.assignedJobIds.includes(jobId)
    ) {
      throw new RecruiterAuthError(
        'Forbidden. You are not assigned as a Hiring Manager for this job requisition.',
        403
      );
    }

    return job;
  }

  /**
   * Checks candidate application access scoped to company and assigned job/candidate.
   */
  static async assertApplicationAccess(auth: AuthenticatedRecruiter, applicationId: string) {
    this.assertActiveMembership(auth);

    const application = await db.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: { companyId: auth.company.id },
      },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!application) {
      throw new RecruiterAuthError('Application not found or access denied.', 404);
    }

    // Role-specific scoping:
    if (auth.companyRole === 'HIRING_MANAGER') {
      if (
        auth.membership.assignedJobIds.length > 0 &&
        !auth.membership.assignedJobIds.includes(application.jobId)
      ) {
        throw new RecruiterAuthError(
          'Forbidden. You are not assigned to the job requisition for this candidate application.',
          403
        );
      }
    } else if (
      auth.companyRole === 'TECHNICAL_INTERVIEWER' ||
      auth.companyRole === 'HR_INTERVIEWER'
    ) {
      // Interviewers can only view applications if they have an assigned interview for this application
      const assignedInterview = await db.interview.findFirst({
        where: {
          applicationId,
          companyId: auth.company.id,
          OR: [
            { interviewerId: auth.user.id },
            { interviewerName: auth.user.name },
          ],
        },
      });

      if (!assignedInterview) {
        throw new RecruiterAuthError(
          'Forbidden. You can only access candidate applications for which you are an assigned interviewer.',
          403
        );
      }
    }

    return application;
  }

  /**
   * Checks interview access, ensuring tenant isolation and role/interviewer assignment.
   */
  static async assertInterviewAccess(
    auth: AuthenticatedRecruiter,
    interviewId: string,
    action: 'view' | 'assign' | 'feedback_technical' | 'feedback_hr' = 'view'
  ) {
    this.assertActiveMembership(auth);

    const interview = await db.interview.findFirst({
      where: { id: interviewId, companyId: auth.company.id },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!interview) {
      throw new RecruiterAuthError('Interview not found or access denied.', 404);
    }

    const isAssigned =
      interview.interviewerId === auth.user.id ||
      interview.interviewerName === auth.user.name;

    if (action === 'assign') {
      this.assertPermission(auth, 'interviews:assign');
    } else if (action === 'feedback_technical') {
      this.assertPermission(auth, 'interviews:feedback_technical');
      // Technical feedback requires technical interviewer role or Admin/Recruiter, and must be assigned
      if (
        auth.companyRole === 'TECHNICAL_INTERVIEWER' &&
        !isAssigned
      ) {
        throw new RecruiterAuthError(
          'Forbidden. You can only submit feedback for interviews assigned to you.',
          403
        );
      }
      if (
        interview.type !== 'TECHNICAL' &&
        auth.companyRole === 'TECHNICAL_INTERVIEWER'
      ) {
        throw new RecruiterAuthError(
          'Forbidden. Technical interviewers may only evaluate technical interviews.',
          403
        );
      }
    } else if (action === 'feedback_hr') {
      this.assertPermission(auth, 'interviews:feedback_hr');
      // HR feedback requires HR interviewer role or Admin/Recruiter, and must be assigned
      if (
        auth.companyRole === 'HR_INTERVIEWER' &&
        !isAssigned
      ) {
        throw new RecruiterAuthError(
          'Forbidden. You can only submit feedback for interviews assigned to you.',
          403
        );
      }
    } else if (action === 'view') {
      if (
        (auth.companyRole === 'TECHNICAL_INTERVIEWER' ||
          auth.companyRole === 'HR_INTERVIEWER') &&
        !isAssigned
      ) {
        throw new RecruiterAuthError(
          'Forbidden. You can only view interview schedules assigned to you.',
          403
        );
      }
    }

    return interview;
  }

  /**
   * Protects the final active Company Admin from accidental removal or demotion.
   */
  static async assertCanDemoteOrRemoveAdmin(companyId: string, targetMemberId: string): Promise<void> {
    const member = await db.companyMember.findUnique({
      where: { id: targetMemberId },
    });

    if (!member || member.companyId !== companyId) {
      throw new RecruiterAuthError('Team member not found.', 404);
    }

    if (member.role === 'COMPANY_ADMIN' && member.status === 'ACTIVE') {
      const activeAdminCount = await db.companyMember.count({
        where: {
          companyId,
          role: 'COMPANY_ADMIN',
          status: 'ACTIVE',
        },
      });

      if (activeAdminCount <= 1) {
        throw new RecruiterAuthError(
          'Cannot demote or remove the last active Company Admin. Appoint another Company Admin before removing this member.',
          400
        );
      }
    }
  }
}
