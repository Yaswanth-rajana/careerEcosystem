import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { AdminJobService } from '@backend/services/adminJobService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.JOBS_MODERATE);
    const body = await request.json();

    const job = await AdminJobService.moderateJob(params.id, body, admin);
    return NextResponse.json({ job });
  } catch (err: any) {
    const status = err.statusCode || (err.name === 'ZodError' ? 422 : 400);
    return NextResponse.json({ error: err.message || 'Failed to moderate job' }, { status });
  }
}
