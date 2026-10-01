import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { EmployerApplicationService } from '@backend/services/recruiter/employerApplicationService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.RECRUITERS_APPROVE);

    let internalNotes: string | undefined;
    try {
      const body = await request.json();
      internalNotes = body.internalNotes || body.note;
    } catch {}

    const result = await EmployerApplicationService.approveApplication(params.id, admin, {
      internalNotes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json(
      { error: err.message || 'Failed to approve employer application' },
      { status }
    );
  }
}
