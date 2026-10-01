import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { AvailabilityService } from '@backend/services/mentorship/availabilityService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const body = await request.json();
    const exception = await AvailabilityService.addException(authMentor.mentor.id, body);
    return NextResponse.json({ exception }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to add availability exception' },
      { status: err.statusCode || 400 }
    );
  }
}
