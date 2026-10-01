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

    const skills = await ProfileService.getSkills(user.id);
    return NextResponse.json({ success: true, data: skills });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve skills' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await request.json();
    const skillsArray = Array.isArray(body) ? body : body.skills;
    if (!Array.isArray(skillsArray)) {
      return NextResponse.json({ error: 'Invalid payload: skills array required' }, { status: 400 });
    }

    const updated = await ProfileService.updateSkills(user.id, skillsArray);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update skills' },
      { status: 400 }
    );
  }
}
