import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterCandidateService } from '@backend/services/recruiter/recruiterCandidateService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const q = searchParams.get('q') || undefined;
    const skill = searchParams.get('skill') || undefined;
    const location = searchParams.get('location') || undefined;
    const candidateType = searchParams.get('candidateType') || undefined;

    const result = await RecruiterCandidateService.searchCandidates(auth.company.id, {
      page,
      limit,
      q,
      skill,
      location,
      candidateType,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search candidates' },
      { status: 500 }
    );
  }
}
