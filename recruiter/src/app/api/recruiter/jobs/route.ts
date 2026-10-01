import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterJobService } from '@backend/services/recruiter/recruiterJobService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const q = searchParams.get('q') || undefined;
    const status = searchParams.get('status') || undefined;
    const workMode = searchParams.get('workMode') || undefined;
    const employmentType = searchParams.get('employmentType') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || undefined;

    const result = await RecruiterJobService.listJobs(auth.company.id, {
      page,
      limit,
      q,
      status,
      workMode,
      employmentType,
      sortBy,
      sortDir,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const job = await RecruiterJobService.createJob(body, auth);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create job' },
      { status: 400 }
    );
  }
}
