import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { ProfileService } from '@backend/services/profileService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const core = await ProfileService.getCoreProfile(user.id);
    return NextResponse.json({ success: true, data: core });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}
