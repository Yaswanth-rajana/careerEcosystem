import { NextResponse } from 'next/server';
import { ConversionService } from '@backend/services/tools/conversion-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('cloudconvert-signature');
    const rawBody = await request.text();

    const result = await ConversionService.handleWebhookEvent(rawBody, signature);

    return NextResponse.json({
      success: true,
      handled: result.handled,
      jobId: result.jobId,
      status: result.status,
    });
  } catch (error: any) {
    console.error('[CLOUDCONVERT_WEBHOOK_ERROR]', error);

    if (error instanceof ToolError && error.code === 'UNAUTHORIZED_ACCESS') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized webhook signature' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
