import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { MentorService } from '@backend/services/mentorService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await getAuthenticatedAdmin(Permission.MENTORS_READ);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const q = searchParams.get('q') || '';
    const domain = searchParams.get('domain') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || undefined;

    const data = await MentorService.listMentors({
      page,
      limit,
      q,
      domain,
      status,
      sortBy,
      sortDir,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to list mentors' }, { status });
  }
}
