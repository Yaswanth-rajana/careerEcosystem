import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { OnboardingLifecycleService } from '@backend/services/onboardingLifecycleService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { resolveAppUrl } from '@backend/services/email/templates/urlHelper';

export const dynamic = 'force-dynamic';

/**
 * Triggers or evaluates pending onboarding reminders across inactive candidates.
 * Secured via explicitly configured CRON_SECRET header or an authenticated ADMIN session.
 * Always resolves trusted application URLs via server configuration (never unvalidated Host headers).
 */
export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      console.error('[OnboardingRemindersAPI] CRON_SECRET is not configured');
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

    // Always use trusted server-configured application URL (mitigates Host Header Poisoning)
    const appUrl = resolveAppUrl();

    const summary = await OnboardingLifecycleService.processPendingReminders({
      appUrl,
    });

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('[OnboardingRemindersAPI] Error processing reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing reminders' },
      { status: 500 }
    );
  }
}
