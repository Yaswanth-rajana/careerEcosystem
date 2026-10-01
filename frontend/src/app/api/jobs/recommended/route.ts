import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { JobMatchingService } from '@backend/services/jobMatchingService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3', 10);

    const items = await JobMatchingService.getRecommendedJobs(user?.id || null, limit);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Job recommended API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load recommendations' },
      { status: 500 }
    );
  }
}
