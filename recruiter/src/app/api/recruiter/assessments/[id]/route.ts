import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterAssessmentService } from '@backend/services/recruiter/recruiterAssessmentService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const assessment = await RecruiterAssessmentService.getAssessmentDetail(
      params.id,
      auth.company.id
    );

    return NextResponse.json({ success: true, data: assessment });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Assessment not found' },
      { status: 404 }
    );
  }
}
