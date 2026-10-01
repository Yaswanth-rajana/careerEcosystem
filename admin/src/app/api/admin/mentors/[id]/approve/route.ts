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
    const admin = await getAuthenticatedAdmin(Permission.MENTORS_APPROVE);
    let note: string | undefined;
    try {
      const body = await request.json();
      note = body.note;
    } catch {}

    const mentor = await MentorService.approveMentor(params.id, admin, note);
    return NextResponse.json({ mentor });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message || 'Failed to approve mentor' }, { status });
  }
}
