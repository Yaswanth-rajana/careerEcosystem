import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { MentorApplicationService } from '@backend/services/mentorApplicationService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.MENTORS_REJECT);
    const body = await request.json();
    const { reason, internalNotes } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'A detailed reason (at least 5 characters) is required when rejecting an application.' },
        { status: 400 }
      );
    }

    const application = await MentorApplicationService.rejectApplication(
      params.id,
      reason,
      admin,
      internalNotes
    );

    return NextResponse.json({ application });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json(
      { error: err.message || 'Failed to reject mentor application' },
      { status }
    );
  }
}
