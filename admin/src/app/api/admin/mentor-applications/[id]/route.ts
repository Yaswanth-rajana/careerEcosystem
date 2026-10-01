import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { MentorApplicationService } from '@backend/services/mentorApplicationService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthenticatedAdmin(Permission.MENTORS_READ);

    const application = await MentorApplicationService.getApplicationDetail(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Mentor application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json(
      { error: err.message || 'Failed to fetch mentor application' },
      { status }
    );
  }
}
