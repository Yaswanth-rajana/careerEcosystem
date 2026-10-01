import { NextResponse } from 'next/server';
import { UserService } from '@backend/services/userService';
import { RecruiterAuthService } from '@backend/services/recruiter/recruiterAuthService';
import { SESSION_COOKIE_OPTIONS } from '@backend/auth/security';
import { RECRUITER_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Authenticate credentials against core user table
    const authResult = await UserService.authenticateUser({ email, password });

    // Enforce recruiter role and active company profile
    const recruiterData = await RecruiterAuthService.verifyRecruiter(authResult.token);

    const response = NextResponse.json({
      success: true,
      recruiter: recruiterData,
    });

    response.cookies.set(RECRUITER_COOKIE_NAME, authResult.token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json(
      { error: err.message || 'Invalid email address or password.' },
      { status }
    );
  }
}
