import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    let authResult;
    try {
      authResult = await UserService.authenticateUser({ email, password });
    } catch (dbError: any) {
      if (dbError.message && (dbError.message.includes('Invalid') || dbError.message.includes('account'))) {
        return NextResponse.json({ error: dbError.message }, { status: 400 });
      }
      return NextResponse.json({ error: dbError.message || 'Authentication failed' }, { status: 400 });
    }

    const { user, token } = authResult;

    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
