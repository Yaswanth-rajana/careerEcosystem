import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterApplicationService } from '@backend/services/recruiter/recruiterApplicationService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const application = await RecruiterApplicationService.getApplicationDetail(
      params.id,
      auth.company.id
    );

    return NextResponse.json({ success: true, data: application });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Application not found' },
      { status: 404 }
    );
  }
}
