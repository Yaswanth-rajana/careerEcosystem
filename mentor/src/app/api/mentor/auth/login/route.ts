import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { db } from '@backend/db/client';
import { MENTOR_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if mentor profile exists with this email
    const mentorRecord = await db.mentor.findUnique({
      where: { email: normalizedEmail },
    });

    if (!mentorRecord) {
      return NextResponse.json(
        { error: 'No mentor account found with this email address. Please apply to become a mentor or verify your credentials.' },
        { status: 404 }
      );
    }

    if (mentorRecord.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your mentor account has been suspended by an administrator. Please contact support.' },
        { status: 403 }
      );
    }

    if (mentorRecord.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Your mentor application was not approved.' },
        { status: 403 }
      );
    }

    if (mentorRecord.status === 'PENDING' || mentorRecord.status === 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'Your mentor application is currently under review by administrators.' },
        { status: 403 }
      );
    }

    // Verify user account exists or authenticate
    let authUser: any;
    let token: string;

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.passwordHash) {
      const authResult = await UserService.authenticateUser({ email: normalizedEmail, password });
      authUser = authResult.user;
      token = authResult.token;
    } else {
      // If user doesn't exist yet or was seeded as mentor, allow registering or initializing the user record
      if (!existingUser) {
        const registered = await UserService.registerUser({
          name: mentorRecord.name,
          email: normalizedEmail,
          password,
          role: 'MENTOR',
        });
        authUser = registered.user;
        token = registered.token;
      } else {
        // User exists without password (e.g. Google auth or seed), authenticate
        const authResult = await UserService.authenticateUser({ email: normalizedEmail, password });
        authUser = authResult.user;
        token = authResult.token;
      }
    }

    // Ensure mentor record is linked to this userId
    if (!mentorRecord.userId) {
      await db.mentor.update({
        where: { id: mentorRecord.id },
        data: { userId: authUser.id },
      });
    }

    // Elevate user role to MENTOR if not already
    if (authUser.role !== 'MENTOR' && authUser.role !== 'ADMIN') {
      await db.user.update({
        where: { id: authUser.id },
        data: { role: 'MENTOR' },
      });
    }

    // Set secure HTTP-only session cookie
    const cookieStore = cookies();
    cookieStore.set(MENTOR_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      user: authUser,
      mustChangePassword: Boolean(existingUser?.mustChangePassword),
      mentor: {
        id: mentorRecord.id,
        name: mentorRecord.name,
        email: mentorRecord.email,
        status: mentorRecord.status,
        domain: mentorRecord.domain,
        headline: mentorRecord.headline,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 401 });
  }
}
