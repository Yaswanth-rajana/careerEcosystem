import { NextResponse } from 'next/server';
import { ConversionProviderFactory } from '@backend/services/tools/provider-factory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provider = ConversionProviderFactory.getProvider();
    const available = await provider.healthCheck();

    return NextResponse.json({
      success: true,
      available,
      provider: provider.name,
    });
  } catch {
    return NextResponse.json({
      success: true,
      available: false,
      provider: 'unknown',
    });
  }
}
