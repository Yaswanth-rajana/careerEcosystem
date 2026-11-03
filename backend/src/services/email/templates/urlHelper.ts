/**
 * Resolves the application base URL safely across environments.
 * Priority: Explicit override -> APP_URL / NEXT_PUBLIC_APP_URL env vars -> Production default (https://pathway.eco) -> Development default (http://localhost:3000).
 */
export function resolveAppUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl = process.env.APP_BASE_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Never default to localhost in production
  if (process.env.NODE_ENV === 'production') {
    return 'https://pathway.eco';
  }

  return 'http://localhost:3000';
}

/**
 * Resolves the Recruiter Portal base URL safely across environments.
 * Priority: Explicit override -> RECRUITER_PORTAL_URL / RECRUITER_APP_URL / APP_BASE_URL env vars -> Production default (https://pathway.eco) -> Development default (http://localhost:3004).
 */
export function resolveRecruiterPortalUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl =
    process.env.RECRUITER_PORTAL_URL ||
    process.env.RECRUITER_APP_URL ||
    process.env.APP_BASE_URL ||
    process.env.APP_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://pathway.eco';
  }

  return 'http://localhost:3004';
}

/**
 * Resolves the Mentor Portal base URL safely across environments.
 * Priority: Explicit override -> MENTOR_PORTAL_URL / MENTOR_APP_URL / APP_BASE_URL env vars -> Production default (https://mentor.pathway.eco) -> Development default (http://localhost:3003).
 */
export function resolveMentorPortalUrl(overrideUrl?: string): string {
  if (overrideUrl && overrideUrl.trim().length > 0) {
    return overrideUrl.trim().replace(/\/+$/, '');
  }

  const envUrl =
    process.env.MENTOR_PORTAL_URL ||
    process.env.MENTOR_APP_URL ||
    process.env.APP_BASE_URL ||
    process.env.APP_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://mentor.pathway.eco';
  }

  return 'http://localhost:3003';
}
