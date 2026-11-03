import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/serverAuth';
import { BookingService } from '@backend/services/mentorship/bookingService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to book a mentorship session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mentorId, serviceId, scheduledStart, timezone, studentNotes } = body;

    if (!mentorId || !serviceId) {
      return NextResponse.json(
        { success: false, error: 'Both mentorId and serviceId are required' },
        { status: 400 }
      );
    }

    if (!scheduledStart) {
      return NextResponse.json(
        { success: false, error: 'scheduledStart is required' },
        { status: 400 }
      );
    }

    const startDate = new Date(scheduledStart);
    if (isNaN(startDate.getTime()) || startDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: 'scheduledStart must be a valid future datetime' },
        { status: 400 }
      );
    }

    const booking = await BookingService.createBooking(user.id, {
      mentorId,
      serviceId,
      scheduledStart: startDate.toISOString(),
      timezone: timezone || 'Asia/Kolkata',
      studentNotes: studentNotes || undefined,
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error('Mentorship booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to book session' },
      { status: 400 }
    );
  }
}
