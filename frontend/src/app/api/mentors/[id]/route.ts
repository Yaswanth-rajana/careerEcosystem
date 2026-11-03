import { NextRequest, NextResponse } from 'next/server';
import { MentorDiscoveryService } from '@backend/services/mentorship/mentorDiscoveryService';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentor = await MentorDiscoveryService.getMentorPublicDetail(params.id);
    if (!mentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor not found or unavailable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mentor,
    });
  } catch (error: any) {
    console.error('Mentor detail API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve mentor' },
      { status: 500 }
    );
  }
}
