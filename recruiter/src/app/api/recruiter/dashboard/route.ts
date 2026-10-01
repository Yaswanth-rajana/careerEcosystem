import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterDashboardService } from '@backend/services/recruiter/recruiterDashboardService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const data = await RecruiterDashboardService.getDashboardMetrics(auth.company.id);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load dashboard metrics' },
      { status: 500 }
    );
  }
}
