import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { MentorService } from '@backend/services/mentorService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.MENTORS_REJECT);
    const body = await request.json();

    if (!body.reason || body.reason.trim().length < 5) {
      return NextResponse.json({ error: 'A rejection reason of at least 5 characters is required.' }, { status: 422 });
    }

    const mentor = await MentorService.rejectMentor(params.id, body.reason, admin);
    return NextResponse.json({ mentor });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message || 'Failed to reject mentor' }, { status });
  }
}
