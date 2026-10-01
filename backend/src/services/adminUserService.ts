import { db } from '../db/client';
import {
  UserListDTO,
  UserDetailDTO,
  PaginatedAdminResult,
} from '../types/admin';
import { AdminUserStatusSchema, AdminUserRoleSchema } from '../validations/adminSchemas';
import { AuditService } from './auditService';
import { AuthenticatedAdmin } from './adminAuthService';

export interface ListAdminUsersParams {
  page?: number;
  limit?: number;
  q?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class AdminUserService {
  /**
   * Retrieves paginated user list with search and filter.
   * Excludes heavy profile relations for high performance.
   */
  static async listUsers(params: ListAdminUsersParams = {}): Promise<PaginatedAdminResult<UserListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.role && params.role !== 'All') {
      where.role = params.role;
    }
    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          isOnboarded: true,
          createdAt: true,
          profile: {
            select: {
              headline: true,
              candidateType: true,
            },
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const items: UserListDTO[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      isOnboarded: u.isOnboarded,
      candidateType: u.profile?.candidateType || null,
      headline: u.profile?.headline || null,
      createdAt: u.createdAt.toISOString(),
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
   * Retrieves comprehensive user profile for student detail inspection.
   * Strictly filters out passwords, hashes, and authentication secrets.
   */
  static async getUserDetail(userId: string): Promise<UserDetailDTO | null> {
    if (!userId) return null;

    const [user, applicationsCount, savedJobsCount] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          isOnboarded: true,
          onboardingCompletedAt: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            include: {
              education: true,
              experience: true,
              userSkills: {
                include: {
                  skill: true,
                },
              },
              projects: true,
              careerGoal: true,
            },
          },
        },
      }),
      db.jobApplication.count({ where: { candidateId: userId } }),
      db.savedJob.count({ where: { userId } }),
    ]);

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isOnboarded: user.isOnboarded,
      onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      applicationsCount,
      savedJobsCount,
      profile: user.profile
        ? {
            headline: user.profile.headline,
            phone: user.profile.phone,
            location: user.profile.location,
            candidateType: user.profile.candidateType,
            currentRole: user.profile.currentRole,
            totalExperience: user.profile.totalExperience,
            bio: user.profile.bio,
            education: user.profile.education.map((e) => ({
              id: e.id,
              institution: e.institution,
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              startYear: e.startYear,
              endYear: e.endYear,
            })),
            experience: user.profile.experience.map((exp) => ({
              id: exp.id,
              company: exp.company,
              roleTitle: exp.roleTitle,
              employmentType: exp.employmentType,
              startDate: exp.startDate,
              endDate: exp.endDate,
              isCurrent: exp.isCurrent,
            })),
            skills: user.profile.userSkills.map((us) => ({
              id: us.id,
              name: us.skill.name,
              level: us.level,
              verified: us.verified,
            })),
            projects: user.profile.projects.map((p) => ({
              id: p.id,
              title: p.title,
              technologies: p.technologies,
              projectUrl: p.projectUrl,
              githubUrl: p.githubUrl,
            })),
            careerGoal: user.profile.careerGoal
              ? {
                  targetRole: user.profile.careerGoal.targetRole,
                  targetIndustry: user.profile.careerGoal.targetIndustry,
                }
              : null,
          }
        : null,
    };
  }

  /**
   * Updates user status (ACTIVE, SUSPENDED, DEACTIVATED).
   */
  static async updateUserStatus(userId: string, input: any, actor: AuthenticatedAdmin): Promise<UserDetailDTO> {
    const validated = AdminUserStatusSchema.parse(input);

    const existing = await db.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Prevent admin from suspending themselves
    if (existing.id === actor.id) {
      throw new Error('Administrators cannot suspend their own active account.');
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        status: validated.status,
      },
    });

    // If suspended or deactivated, revoke active sessions
    if (validated.status !== 'ACTIVE') {
      await db.session.deleteMany({ where: { userId } }).catch(() => {});
    }

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: `USER_STATUS_CHANGED_${validated.status}`,
      resourceType: 'USER',
      resourceId: userId,
      details: {
        targetUserEmail: existing.email,
        previousStatus: existing.status,
        newStatus: validated.status,
        reason: validated.reason,
      },
    });

    return (await this.getUserDetail(userId))!;
  }

  /**
   * Changes user role (SUPER_ADMIN permission required).
   */
  static async updateUserRole(userId: string, input: any, actor: AuthenticatedAdmin): Promise<UserDetailDTO> {
    const validated = AdminUserRoleSchema.parse(input);

    const existing = await db.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Prevent demoting self from SUPER_ADMIN
    if (existing.id === actor.id && validated.role !== 'SUPER_ADMIN') {
      throw new Error('Super Administrators cannot demote their own account.');
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        role: validated.role,
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'ADMIN_ROLE_CHANGED',
      resourceType: 'USER',
      resourceId: userId,
      details: {
        targetUserEmail: existing.email,
        previousRole: existing.role,
        newRole: validated.role,
        reason: validated.reason,
      },
    });

    return (await this.getUserDetail(userId))!;
  }
}
