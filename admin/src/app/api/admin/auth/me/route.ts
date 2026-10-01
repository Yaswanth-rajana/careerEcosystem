import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    return NextResponse.json({ user: admin });
  } catch (err: any) {
    const status = err.statusCode || 401;
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status });
  }
}
