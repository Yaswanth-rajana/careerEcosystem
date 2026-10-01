import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { AdminJobService } from '@backend/services/adminJobService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthenticatedAdmin(Permission.JOBS_READ);
    const job = await AdminJobService.getJobDetail(params.id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to fetch job details' }, { status });
  }
}
