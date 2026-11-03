import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { ProfileService } from '@backend/services/profileService';
import { getCategoryLabel } from '@backend/types/mentorship';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();
    const { preference } = body;

    if (!user) {
      // Return 200 with saved: false if guest candidate
      return NextResponse.json({
        success: true,
        saved: false,
        preference,
      });
    }

    if (preference) {
      const label = getCategoryLabel(preference);
      const profile = await ProfileService.getOrCreateProfile(user.id);
      const existingNeeds = profile.mentorshipNeeds || [];
      const updatedNeeds = Array.from(new Set([label, ...existingNeeds]));

      await ProfileService.updateJobPreferences(user.id, {
        mentorshipNeeds: updatedNeeds,
      });
    }

    return NextResponse.json({
      success: true,
      saved: true,
      preference,
    });
  } catch (error: any) {
    console.error('Save preference error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save preference' },
      { status: 500 }
    );
  }
}
