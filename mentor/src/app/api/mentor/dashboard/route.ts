import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorDashboardService } from '@backend/services/mentorship/mentorDashboardService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const dashboardData = await MentorDashboardService.getDashboard(authMentor.mentor.id);
    return NextResponse.json(dashboardData);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch mentor dashboard data' },
      { status: err.statusCode || 500 }
    );
  }
}
