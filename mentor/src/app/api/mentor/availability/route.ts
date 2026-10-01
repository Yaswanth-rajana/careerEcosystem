import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { AvailabilityService } from '@backend/services/mentorship/availabilityService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const [rules, exceptions, summary] = await Promise.all([
      AvailabilityService.getWeeklyRules(authMentor.mentor.id),
      AvailabilityService.getExceptions(authMentor.mentor.id),
      AvailabilityService.getAvailabilitySummary(authMentor.mentor.id),
    ]);
    return NextResponse.json({ rules, exceptions, summary });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch availability' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const body = await request.json();
    const updatedRules = await AvailabilityService.setWeeklyRules(authMentor.mentor.id, body);
    return NextResponse.json({ rules: updatedRules });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update weekly availability' },
      { status: err.statusCode || 400 }
    );
  }
}
