import { NextResponse } from 'next/server';
import { CleanupService } from '@backend/services/tools/cleanup-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized cleanup request' },
        { status: 401 }
      );
    }

    const result = await CleanupService.runCleanupCycle();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cleanup cycle failed',
      },
      { status: 500 }
    );
  }
}
