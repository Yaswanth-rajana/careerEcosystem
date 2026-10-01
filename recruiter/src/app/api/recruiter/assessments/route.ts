import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterAssessmentService } from '@backend/services/recruiter/recruiterAssessmentService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const assessments = await RecruiterAssessmentService.listAssessments(auth.company.id);

    return NextResponse.json({ success: true, data: assessments });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const assessment = await RecruiterAssessmentService.createAssessment(body, auth);
    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create assessment' },
      { status: 400 }
    );
  }
}
