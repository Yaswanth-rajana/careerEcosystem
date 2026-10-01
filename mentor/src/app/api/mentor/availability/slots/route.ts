import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { AvailabilityService } from '@backend/services/mentorship/availabilityService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const duration = parseInt(searchParams.get('duration') || '30', 10);

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate query params are required' }, { status: 400 });
    }

    const slots = await AvailabilityService.getAvailableSlots({
      mentorId: authMentor.mentor.id,
      startDate,
      endDate,
      durationMinutes: duration,
    });

    return NextResponse.json({ slots });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to calculate available slots' },
      { status: err.statusCode || 400 }
    );
  }
}
