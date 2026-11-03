import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { db } from '@backend/db/client';
import { MENTOR_COOKIE_NAME } from '../../../../../lib/serverAuth';
import { AuditService } from '@backend/services/auditService';

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

    // Verify user account exists and has an activated password
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // An approved mentor without an activated User account or password must not be able to login or auto-register.
    // They must use the secure account-activation link sent by email.
    if (!existingUser || !existingUser.passwordHash) {
      return NextResponse.json(
        { error: 'Your account has not been activated yet. Please use the secure account-activation link sent to your email to set your password.' },
        { status: 401 }
      );
    }

    if (existingUser.status && existingUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Your account is currently ${existingUser.status.toLowerCase()}. Access denied.` },
        { status: 403 }
      );
    }

    // Authenticate user credentials
    const authResult = await UserService.authenticateUser({ email: normalizedEmail, password });
    const authUser = authResult.user;
    const token = authResult.token;

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
