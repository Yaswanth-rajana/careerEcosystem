import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { AdminDashboardService } from '@backend/services/adminDashboardService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await getAuthenticatedAdmin(Permission.ANALYTICS_READ);
    const data = await AdminDashboardService.getDashboardMetrics();
    return NextResponse.json(data);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to fetch dashboard metrics' }, { status });
  }
}
