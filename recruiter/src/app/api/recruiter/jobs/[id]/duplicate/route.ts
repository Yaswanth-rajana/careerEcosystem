import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterJobService } from '@backend/services/recruiter/recruiterJobService';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const cloned = await RecruiterJobService.duplicateJob(params.id, auth);

    return NextResponse.json({ success: true, data: cloned }, { status: 201 });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to duplicate job' },
      { status: 400 }
    );
  }
}
