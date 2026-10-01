import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorshipServiceManager } from '@backend/services/mentorship/mentorshipService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const body = await request.json();
    const service = await MentorshipServiceManager.updateService(
      params.id,
      authMentor.mentor.id,
      body
    );
    return NextResponse.json({ service });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update mentorship service' },
      { status: err.statusCode || 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const result = await MentorshipServiceManager.deactivateOrDeleteService(
      params.id,
      authMentor.mentor.id
    );
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to remove mentorship service' },
      { status: err.statusCode || 400 }
    );
  }
}
