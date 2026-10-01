import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PasswordSetupSchema } from '@backend/validations/schemas';
import { PasswordSetupTokenService } from '@backend/services/passwordSetupTokenService';
import { MENTOR_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = PasswordSetupSchema.parse(body);

    const result = await PasswordSetupTokenService.consumeSetupToken(
      validated.token,
      validated.password
    );

    // Set secure HTTP-only session cookie for instant seamless login to mentor dashboard
    const cookieStore = cookies();
    cookieStore.set(MENTOR_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      message: 'Password set successfully. Welcome to your Mentor Workspace!',
      user: result.user,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const firstError = err.errors?.[0]?.message || 'Validation error';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message || 'Failed to establish password.' },
      { status: 400 }
    );
  }
}
