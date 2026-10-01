import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authMentor = await getAuthenticatedMentor(false);
    return NextResponse.json(authMentor);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unauthorized' },
      { status: err.statusCode || 401 }
    );
  }
}
