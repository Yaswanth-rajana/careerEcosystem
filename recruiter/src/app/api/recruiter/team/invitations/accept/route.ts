import { NextRequest, NextResponse } from 'next/server';
import { RecruiterTeamService } from '@backend/services/recruiter/recruiterTeamService';
import { RecruiterAuthError } from '@backend/services/recruiter/recruiterAuthService';

import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_OPTIONS } from '@backend/auth/security';
import { RECRUITER_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invitation token is required.' },
        { status: 400 }
      );
    }

    const result = await RecruiterTeamService.acceptInvitation(token);
    const sessionToken = await UserService.createSession(result.userId);

    const response = NextResponse.json({
      ...result,
      sessionToken,
    });

    response.cookies.set(RECRUITER_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to accept invitation' },
      { status: 400 }
    );
  }
}
