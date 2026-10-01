import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterInterviewService } from '@backend/services/recruiter/recruiterInterviewService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const updated = await RecruiterInterviewService.updateInterview(params.id, body, auth);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update interview' },
      { status: 400 }
    );
  }
}
