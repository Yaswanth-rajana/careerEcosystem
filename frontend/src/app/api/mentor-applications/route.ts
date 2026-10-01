import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { MentorApplicationService } from '@backend/services/mentorApplicationService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    let authenticatedUser: any = null;

    if (token) {
      authenticatedUser = await UserService.getSession(token).catch(() => null);
    }

    const body = await request.json();

    // Section 3: If user is authenticated, use authenticated account identity where appropriate
    if (authenticatedUser?.email && body.email) {
      if (authenticatedUser.email.toLowerCase() !== body.email.toLowerCase().trim()) {
        return NextResponse.json(
          {
            error: `You are currently logged in as ${authenticatedUser.email}. Please use your verified account email address or sign out to apply with a different email.`,
          },
          { status: 400 }
        );
      }
    }

    const result = await MentorApplicationService.submitApplication(body, authenticatedUser);

    if (!result.success && result.alreadyApproved) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const firstError = err.errors?.[0]?.message || 'Validation error';
      return NextResponse.json({ error: firstError, details: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while submitting your application.' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ application: null });
    }

    const user = await UserService.getSession(token);
    if (!user) {
      return NextResponse.json({ application: null });
    }

    const { db } = await import('@backend/db/client');
    const existingApp = await db.mentorApplication.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        referenceId: true,
        status: true,
        fullName: true,
        email: true,
        domain: true,
        createdAt: true,
        decisionReason: true,
      },
    });

    return NextResponse.json({ application: existingApp });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch application' }, { status: 500 });
  }
}
