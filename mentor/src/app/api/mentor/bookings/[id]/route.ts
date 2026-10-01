import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { BookingService } from '@backend/services/mentorship/bookingService';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const booking = await BookingService.getBookingDetail(params.id, authMentor.mentor.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ booking });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve booking' },
      { status: err.statusCode || 403 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const body = await request.json();
    const updated = await BookingService.updateBookingStatus(
      params.id,
      authMentor.mentor.id,
      body
    );
    return NextResponse.json({ booking: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update booking status' },
      { status: err.statusCode || 400 }
    );
  }
}
