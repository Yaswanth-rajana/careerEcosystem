import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { BookingService } from '@backend/services/mentorship/bookingService';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;

    const scheduledStart = body.scheduledStart || body.newStart;
    if (!scheduledStart) {
      return NextResponse.json(
        { success: false, error: 'scheduledStart is required to reschedule a booking' },
        { status: 400 }
      );
    }

    const updated = await BookingService.rescheduleBookingByCandidate(
      params.id,
      user.id,
      {
        scheduledStart,
        timezone: body.timezone || 'Asia/Kolkata',
        studentNotes: body.studentNotes || body.reason || null,
      },
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Reschedule request submitted successfully. Awaiting mentor confirmation.',
      booking: updated,
    });
  } catch (error: any) {
    const status =
      error.statusCode ||
      (error.message?.includes('already been cancelled') ||
      error.message?.includes('reserved by another') ||
      error.message?.includes('high contention')
        ? 409
        : 400);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reschedule booking' },
      { status }
    );
  }
}
