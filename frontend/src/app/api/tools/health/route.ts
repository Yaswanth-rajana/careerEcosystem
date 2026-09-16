import { NextResponse } from 'next/server';
import { GotenbergConversionProvider } from '@backend/services/tools/gotenberg-provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provider = new GotenbergConversionProvider();
    const available = await provider.healthCheck();

    return NextResponse.json({
      success: true,
      available,
    });
  } catch {
    return NextResponse.json({
      success: true,
      available: false,
    });
  }
}
