import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorProfileService } from '@backend/services/mentorship/mentorProfileService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authMentor = await getAuthenticatedMentor(false);
    const profile = await MentorProfileService.getProfile(authMentor.mentor.id);
    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch profile' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(false);
    const body = await request.json();
    const updated = await MentorProfileService.updateProfile(authMentor.mentor.id, body);
    return NextResponse.json({ profile: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update profile' },
      { status: err.statusCode || 400 }
    );
  }
}
