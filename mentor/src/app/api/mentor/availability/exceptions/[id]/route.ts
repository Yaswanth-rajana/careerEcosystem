import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { AvailabilityService } from '@backend/services/mentorship/availabilityService';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    await AvailabilityService.deleteException(params.id, authMentor.mentor.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to remove exception' },
      { status: err.statusCode || 400 }
    );
  }
}
