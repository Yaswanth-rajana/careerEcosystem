import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { BookingService } from '@backend/services/mentorship/bookingService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const { searchParams } = new URL(request.url);

    const tab = (searchParams.get('tab') as any) || undefined;
    const status = searchParams.get('status') || undefined;
    const serviceId = searchParams.get('serviceId') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const result = await BookingService.listBookings({
      mentorId: authMentor.mentor.id,
      tab,
      status,
      serviceId,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list bookings' },
      { status: err.statusCode || 500 }
    );
  }
}
