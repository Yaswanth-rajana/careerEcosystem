import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { db } from '@backend/db/client';
import { hashPassword } from '@backend/auth/security';
import { AuditService } from '@backend/services/auditService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(false);
    const body = await request.json();
    const { password, confirmPassword } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

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
      action: 'MENTOR_PASSWORD_SETUP_COMPLETED',
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
