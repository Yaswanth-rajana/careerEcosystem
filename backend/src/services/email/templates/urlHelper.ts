/**
 * Production and Development Canonical URLs for all PATHWAY.ECO Portals
 */
export const PORTAL_URLS = {
  frontend: {
    production: 'https://frontend-two-pi-85.vercel.app',
    development: 'http://localhost:3000',
  },
  recruiter: {
    production: 'https://career-ecosystem-kappa.vercel.app',
    development: 'http://localhost:3004',
  },
  mentor: {
    production: 'https://career-ecosystem-mentor.vercel.app',
    development: 'http://localhost:3003',
  },
  admin: {
    production: 'https://career-ecosystem-admin.vercel.app',
    development: 'http://localhost:3002',
  },
} as const;

/**
 * Resolves the application base URL safely across environments (Candidate / Student Portal).
 * Priority: Explicit override -> APP_BASE_URL / APP_URL / NEXT_PUBLIC_APP_URL env vars -> Production Vercel URL -> Development localhost.
 */
export function resolveAppUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl = process.env.APP_URL || process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Production Vercel Deployment
  if (process.env.NODE_ENV === 'production') {
    return PORTAL_URLS.frontend.production;
  }

  return PORTAL_URLS.frontend.development;
}

/**
 * Resolves the Recruiter / Employer Portal base URL safely across environments.
 * Priority: Explicit override -> RECRUITER_PORTAL_URL / RECRUITER_APP_URL / NEXT_PUBLIC_RECRUITER_PORTAL_URL env vars -> Production Vercel URL -> Development localhost.
 */
export function resolveRecruiterPortalUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl =
    process.env.RECRUITER_PORTAL_URL ||
    process.env.RECRUITER_APP_URL ||
    process.env.NEXT_PUBLIC_RECRUITER_PORTAL_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return PORTAL_URLS.recruiter.production;
  }

  return PORTAL_URLS.recruiter.development;
}

/**
 * Resolves the Mentor Portal base URL safely across environments.
 * Priority: Explicit override -> MENTOR_PORTAL_URL / MENTOR_APP_URL / NEXT_PUBLIC_MENTOR_PORTAL_URL env vars -> Production Vercel URL -> Development localhost.
 */
export function resolveMentorPortalUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl =
    process.env.MENTOR_PORTAL_URL ||
    process.env.MENTOR_APP_URL ||
    process.env.NEXT_PUBLIC_MENTOR_PORTAL_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return PORTAL_URLS.mentor.production;
  }

  return PORTAL_URLS.mentor.development;
}

/**
 * Resolves the Admin Portal base URL safely across environments.
 * Priority: Explicit override -> ADMIN_PORTAL_URL / ADMIN_APP_URL / NEXT_PUBLIC_ADMIN_PORTAL_URL env vars -> Production Vercel URL -> Development localhost.
 */
export function resolveAdminPortalUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl =
    process.env.ADMIN_PORTAL_URL ||
    process.env.ADMIN_APP_URL ||
    process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return PORTAL_URLS.admin.production;
  }

  return PORTAL_URLS.admin.development;
}
