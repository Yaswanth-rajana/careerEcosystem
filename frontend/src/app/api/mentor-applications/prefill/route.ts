import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { db } from '@backend/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ prefill: null });
    }

    const sessionUser = await UserService.getSession(token);
    if (!sessionUser) {
      return NextResponse.json({ prefill: null });
    }

    const userWithProfile = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        profile: {
          include: {
            professionalLinks: true,
            userSkills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    if (!userWithProfile) {
      return NextResponse.json({ prefill: null });
    }

    const profile = userWithProfile.profile;
    const links = profile?.professionalLinks || [];

    const linkedIn = links.find((l) => l.platform.toLowerCase() === 'linkedin')?.url || '';
    const gitHub = links.find((l) => l.platform.toLowerCase() === 'github')?.url || '';
    const portfolio = links.find((l) => ['portfolio', 'personal website'].includes(l.platform.toLowerCase()))?.url || '';

    // Extract numerical experience years if possible
    let experienceYears = 0;
    if (profile?.totalExperience) {
      const match = profile.totalExperience.match(/\d+/);
      if (match) {
        experienceYears = parseInt(match[0], 10);
      }
    }

    const skills = profile?.userSkills.map((us) => us.skill.name) || [];

    const prefill = {
      fullName: userWithProfile.name,
      email: userWithProfile.email,
      phone: profile?.phone || '',
      location: profile?.location || '',
      currentRole: profile?.currentRole || profile?.headline || '',
      experienceYears,
      linkedIn,
      gitHub,
      portfolio,
      expertise: skills.slice(0, 5),
    };

    return NextResponse.json({ prefill });
  } catch (err: any) {
    return NextResponse.json({ prefill: null, error: err.message }, { status: 200 });
  }
}
