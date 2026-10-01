import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { DashboardService } from '@backend/services/dashboardService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const dashboardData = await DashboardService.getDashboardData(user.id);
    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error: any) {
    console.error('Failed to load dashboard data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve dashboard data' },
      { status: 500 }
    );
  }
}
