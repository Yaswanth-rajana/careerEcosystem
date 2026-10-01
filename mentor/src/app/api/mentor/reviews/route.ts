import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { ReviewService } from '@backend/services/mentorship/reviewService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await ReviewService.listReviewsByMentor({
      mentorId: authMentor.mentor.id,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list reviews' },
      { status: err.statusCode || 500 }
    );
  }
}
