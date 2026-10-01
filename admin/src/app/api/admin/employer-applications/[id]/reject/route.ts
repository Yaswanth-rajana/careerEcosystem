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
    const admin = await getAuthenticatedAdmin(Permission.RECRUITERS_REJECT);

    let decisionReason: string | undefined;
    let internalNotes: string | undefined;
    try {
      const body = await request.json();
      decisionReason = body.reason || body.decisionReason;
      internalNotes = body.internalNotes;
    } catch {}

    const application = await EmployerApplicationService.rejectApplication(
      params.id,
      admin,
      { decisionReason, internalNotes }
    );

    return NextResponse.json({ application });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json(
      { error: err.message || 'Failed to reject employer application' },
      { status }
    );
  }
}
