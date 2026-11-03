import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SignUpSchema } from '@backend/validations/schemas';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let validated;
    try {
      validated = SignUpSchema.parse(body);
    } catch (validationErr: any) {
      const message = validationErr?.errors?.[0]?.message || 'Invalid registration details provided.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    let result;
    try {
      result = await UserService.registerUser(validated);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 400 });
    }

    const { user, token } = result;

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
