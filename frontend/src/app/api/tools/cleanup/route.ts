import { NextResponse } from 'next/server';
import { CleanupService } from '@backend/services/tools/cleanup-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      console.error('[ToolCleanupAPI] CRON_SECRET is not configured');
      return NextResponse.json(
        { success: false, error: 'Cleanup service configuration error' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
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
    console.error('[ToolCleanupAPI] Cleanup cycle error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup cycle failed',
      },
      { status: 500 }
    );
  }
}
