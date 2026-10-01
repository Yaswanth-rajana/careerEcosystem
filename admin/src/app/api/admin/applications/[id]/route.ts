import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { AdminApplicationService } from '@backend/services/adminApplicationService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthenticatedAdmin(Permission.APPLICATIONS_READ);
    const application = await AdminApplicationService.getApplicationDetail(params.id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to fetch application details' }, { status });
  }
}
