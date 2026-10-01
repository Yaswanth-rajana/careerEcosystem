import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterApplicationService } from '@backend/services/recruiter/recruiterApplicationService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const q = searchParams.get('q') || undefined;
    const status = searchParams.get('status') || undefined;
    const jobId = searchParams.get('jobId') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || undefined;

    const result = await RecruiterApplicationService.listApplications(auth.company.id, {
      page,
      limit,
      q,
      status,
      jobId,
      sortBy,
      sortDir,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list applications' },
      { status: 500 }
    );
  }
}
