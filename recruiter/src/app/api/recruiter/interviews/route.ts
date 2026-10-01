import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterInterviewService } from '@backend/services/recruiter/recruiterInterviewService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get('filter') as 'upcoming' | 'today' | 'completed' | 'all') || 'all';

    const interviews = await RecruiterInterviewService.listInterviews(auth.company.id, filter);
    return NextResponse.json({ success: true, data: interviews });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list interviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const interview = await RecruiterInterviewService.scheduleInterview(body, auth);
    return NextResponse.json({ success: true, data: interview }, { status: 201 });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to schedule interview' },
      { status: 400 }
    );
  }
}
