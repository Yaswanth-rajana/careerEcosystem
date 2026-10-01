import { NextResponse } from 'next/server';
import { PasswordSetupTokenService } from '@backend/services/passwordSetupTokenService';
import { SESSION_COOKIE_OPTIONS } from '@backend/auth/security';
import { RECRUITER_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const result = await PasswordSetupTokenService.consumeSetupToken(token, password);

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    response.cookies.set(RECRUITER_COOKIE_NAME, result.sessionToken, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to setup password.' },
      { status: 400 }
    );
  }
}
