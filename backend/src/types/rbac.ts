export const UserRole = {
  CANDIDATE: 'CANDIDATE',
  MENTOR: 'MENTOR',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  // Users
  USERS_READ: 'USERS_READ',
  USERS_UPDATE: 'USERS_UPDATE',
  USERS_MANAGE_ROLE: 'USERS_MANAGE_ROLE',

  // Courses
  COURSES_READ: 'COURSES_READ',
  COURSES_CREATE: 'COURSES_CREATE',
  COURSES_UPDATE: 'COURSES_UPDATE',
  COURSES_PUBLISH: 'COURSES_PUBLISH',
  COURSES_DELETE: 'COURSES_DELETE',

  // Mentors
  MENTORS_READ: 'MENTORS_READ',
  MENTORS_APPROVE: 'MENTORS_APPROVE',
  MENTORS_REJECT: 'MENTORS_REJECT',
  MENTORS_UPDATE: 'MENTORS_UPDATE',

  // Recruiters & Employers
  RECRUITERS_READ: 'RECRUITERS_READ',
  RECRUITERS_APPROVE: 'RECRUITERS_APPROVE',
  RECRUITERS_REJECT: 'RECRUITERS_REJECT',
  RECRUITERS_SUSPEND: 'RECRUITERS_SUSPEND',
  COMPANIES_READ: 'COMPANIES_READ',
  COMPANIES_UPDATE: 'COMPANIES_UPDATE',
  COMPANIES_VERIFY: 'COMPANIES_VERIFY',

  // Jobs
  JOBS_READ: 'JOBS_READ',
  JOBS_CREATE: 'JOBS_CREATE',
  JOBS_MODERATE: 'JOBS_MODERATE',
  JOBS_UPDATE: 'JOBS_UPDATE',

  // Applications
  APPLICATIONS_READ: 'APPLICATIONS_READ',
  APPLICATIONS_UPDATE: 'APPLICATIONS_UPDATE',

  // Assessments & Interviews
  ASSESSMENTS_MANAGE: 'ASSESSMENTS_MANAGE',
  INTERVIEWS_MANAGE: 'INTERVIEWS_MANAGE',
  OFFERS_MANAGE: 'OFFERS_MANAGE',

  // Audit Logs & Analytics
  AUDIT_LOGS_READ: 'AUDIT_LOGS_READ',
  ANALYTICS_READ: 'ANALYTICS_READ',

  // Settings
  SETTINGS_MANAGE: 'SETTINGS_MANAGE',
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<string, readonly PermissionType[]> = {
  SUPER_ADMIN: Object.values(Permission),

  ADMIN: [
    Permission.USERS_READ,
    Permission.USERS_UPDATE,

    Permission.COURSES_READ,
    Permission.COURSES_CREATE,
    Permission.COURSES_UPDATE,
    Permission.COURSES_PUBLISH,

    Permission.MENTORS_READ,
    Permission.MENTORS_APPROVE,
    Permission.MENTORS_REJECT,
    Permission.MENTORS_UPDATE,

    Permission.RECRUITERS_READ,
    Permission.RECRUITERS_APPROVE,
    Permission.RECRUITERS_REJECT,
    Permission.RECRUITERS_SUSPEND,
    Permission.COMPANIES_READ,
    Permission.COMPANIES_UPDATE,
    Permission.COMPANIES_VERIFY,

    Permission.JOBS_READ,
    Permission.JOBS_MODERATE,
    Permission.JOBS_UPDATE,

    Permission.APPLICATIONS_READ,
    Permission.APPLICATIONS_UPDATE,

    Permission.ANALYTICS_READ,
    Permission.AUDIT_LOGS_READ,
  ],

  RECRUITER: [
    Permission.JOBS_READ,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,
    Permission.APPLICATIONS_READ,
    Permission.APPLICATIONS_UPDATE,
    Permission.ASSESSMENTS_MANAGE,
    Permission.INTERVIEWS_MANAGE,
    Permission.OFFERS_MANAGE,
    Permission.COMPANIES_READ,
  ],

  MENTOR: [
    Permission.COURSES_READ,
  ],

  CANDIDATE: [],
};

export function hasPermission(role: string | null | undefined, permission: PermissionType): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role.toUpperCase()];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasAnyPermission(role: string | null | undefined, permissions: PermissionType[]): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === UserRole.ADMIN || upper === UserRole.SUPER_ADMIN;
}
