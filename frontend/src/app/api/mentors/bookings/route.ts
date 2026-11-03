import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { BookingService } from '@backend/services/mentorship/bookingService';
import { CandidateListBookingsQuerySchema } from '@backend/validations/mentorshipSchemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view mentorship bookings' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = CandidateListBookingsQuerySchema.safeParse({
      tab: searchParams.get('tab') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsedQuery.error.errors[0]?.message || 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const { tab, status, page, limit } = parsedQuery.data;

    // candidateId is strictly derived from server session, never from client query
    const result = await BookingService.listCandidateBookings(user.id, {
      tab,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Candidate bookings API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve mentorship bookings' },
      { status: 500 }
    );
  }
}
