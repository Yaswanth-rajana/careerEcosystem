import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { verifyGoogleIdToken } from '@backend/auth/googleAuth';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google credential token is required.' },
        { status: 400 }
      );
    }

    // 1. Verify Google ID token server-side (signature, audience, issuer, exp, email_verified)
    let verified;
    try {
      verified = await verifyGoogleIdToken(credential);
    } catch (verifyError: any) {
      console.error('[GoogleAuth] Token verification failed:', verifyError.message);
      return NextResponse.json(
        { error: 'Invalid or expired Google credential. Please try again.' },
        { status: 400 }
      );
    }

    // 2. Authenticate, link, or register user in existing database
    let authResult;
    try {
      authResult = await UserService.authenticateWithGoogle({
        googleId: verified.sub,
        email: verified.email,
        emailVerified: verified.emailVerified,
        name: verified.name,
        avatarUrl: verified.picture,
      });
    } catch (authError: any) {
      console.error('[GoogleAuth] UserService error:', authError.message);
      return NextResponse.json(
        { error: authError.message || 'Failed to authenticate with Google.' },
        { status: 400 }
      );
    }

    const { user, token } = authResult;

    // 3. Set standard career_session cookie
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    const onboardingComplete = Boolean(user.isOnboarded);
    const redirectTo = onboardingComplete ? '/dashboard' : '/onboarding';

    return NextResponse.json({
      success: true,
      user,
      onboardingComplete,
      redirectTo,
    });
  } catch (error: any) {
    console.error('[GoogleAuth] Unexpected server error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during Google sign-in. Please try again.' },
      { status: 500 }
    );
  }
}
