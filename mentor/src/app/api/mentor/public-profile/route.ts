import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorDiscoveryService } from '@backend/services/mentorship/mentorDiscoveryService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authMentor = await getAuthenticatedMentor(false);
    const mentor = await MentorDiscoveryService.getMentorPublicDetail(authMentor.mentor.id, {
      allowUnapproved: true,
    });

    if (!mentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mentor,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch public mentor profile' },
      { status: err.statusCode || 500 }
    );
  }
}
