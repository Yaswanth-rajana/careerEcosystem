import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '../../../../../lib/serverAuth';
import { db } from '@backend/db/client';
import { hashPassword } from '@backend/auth/security';
import { UserService } from '@backend/services/userService';
import { AuditService } from '@backend/services/auditService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(false);
    const body = await request.json();
    const { currentPassword, newPassword, password, confirmPassword } = body;
    const effectiveNewPassword = newPassword || password;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required.' },
        { status: 400 }
      );
    }

    if (!effectiveNewPassword || effectiveNewPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && effectiveNewPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // Validate the authenticated user's current password
    const isCurrentValid = await UserService.validatePassword(authMentor.user.id, currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Incorrect current password.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(effectiveNewPassword);

    await db.user.update({
      where: { id: authMentor.user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    await AuditService.log({
      actorId: authMentor.user.id,
      actorEmail: authMentor.user.email,
      actorName: authMentor.user.name,
      action: 'MENTOR_PASSWORD_CHANGED',
      resourceType: 'USER',
      resourceId: authMentor.user.id,
      details: { email: authMentor.user.email },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json(
      { error: err.message || 'Failed to change password.' },
      { status }
    );
  }
}
