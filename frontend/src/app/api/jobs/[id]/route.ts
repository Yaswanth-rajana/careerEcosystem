import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { JobService } from '@backend/services/jobService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const job = await JobService.getJobById(params.id, user?.id || null);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found or no longer available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    console.error('Job detail API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve job details' },
      { status: 500 }
    );
  }
}
