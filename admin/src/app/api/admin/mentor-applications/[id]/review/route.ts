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
    const admin = await getAuthenticatedAdmin(Permission.MENTORS_APPROVE);
    const application = await MentorApplicationService.startReview(params.id, admin);
    return NextResponse.json({ application });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json(
      { error: err.message || 'Failed to update review status' },
      { status }
    );
  }
}
