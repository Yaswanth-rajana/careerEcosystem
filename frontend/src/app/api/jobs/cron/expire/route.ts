import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JobExpirationService } from '@backend/services/jobExpirationService';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

/**
 * Scheduled cron endpoint for automatic 30-day job expiration.
 *
 * Enforces:
 * - PUBLISHED jobs where publishedAt <= now - 30 days are transitioned to EXPIRED.
 * - Idempotent execution (safe to run once daily or multiple times).
 * - Secured via explicitly configured CRON_SECRET authorization header or active ADMIN session.
 * - Supports both GET (Vercel Cron default) and POST triggers.
 */
async function handleExpiration(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      console.error('[JobExpirationCronAPI] CRON_SECRET is not configured');
      return NextResponse.json(
        { success: false, error: 'Cron service configuration error' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization') || '';
    const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuthorized) {
      // Fallback: Check if caller is an authenticated ADMIN
      let token: string | undefined;
      try {
        const cookieStore = cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      } catch {
        const cookieHeader = request.headers.get('cookie') || '';
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
        token = match ? decodeURIComponent(match[1]) : undefined;
      }

      let isAdmin = false;
      if (token) {
        const user = await UserService.getSession(token);
        if (user && user.role === 'ADMIN') {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Valid CRON_SECRET token or Admin session required.' },
          { status: 401 }
        );
      }
    }

    const result = await JobExpirationService.expireOldJobs();

    return NextResponse.json({
      message: 'Successfully processed 30-day job expiration lifecycle.',
      ...result,
    });
  } catch (error: any) {
    console.error('[JobExpirationCronAPI] Error running job expiration cycle:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during job expiration cycle',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleExpiration(request);
}

export async function POST(request: Request) {
  return handleExpiration(request);
}
