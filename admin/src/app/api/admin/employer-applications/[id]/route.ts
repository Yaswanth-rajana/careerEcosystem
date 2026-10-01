import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { EmployerApplicationService } from '@backend/services/recruiter/employerApplicationService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthenticatedAdmin(Permission.RECRUITERS_READ);

    const application = await EmployerApplicationService.getApplicationDetail(params.id);
    return NextResponse.json({ application });
  } catch (err: any) {
    const status = err.statusCode || 404;
    return NextResponse.json(
      { error: err.message || 'Employer application not found' },
      { status }
    );
  }
}
