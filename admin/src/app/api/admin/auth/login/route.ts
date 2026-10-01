import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { isAdminRole } from '@backend/types/rbac';
import { AuditService } from '@backend/services/auditService';

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
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Invalid credentials' }, { status: 401 });
    }

    const { user, token } = authResult;

    // Strict role check: Must be ADMIN or SUPER_ADMIN
    if (!isAdminRole(user.role)) {
      // Invalidate the session immediately
      await UserService.logoutSession(token);
      return NextResponse.json(
        { error: 'Access denied. You do not possess administrative permissions for PATHWAY.ECO.' },
        { status: 403 }
      );
    }

    // Set secure HTTP-only admin cookie
    const ADMIN_COOKIE_NAME = 'pathway_admin_session';
    const cookieStore = cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    // Record audit event
    await AuditService.log({
      actorId: user.id,
      actorEmail: user.email,
      actorName: user.name,
      action: 'ADMIN_LOGIN_SUCCESS',
      resourceType: 'SYSTEM',
      resourceId: user.id,
      details: { role: user.role },
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
