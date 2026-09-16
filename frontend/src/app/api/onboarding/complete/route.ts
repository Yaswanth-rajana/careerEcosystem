import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { OnboardingService } from '@backend/services/onboardingService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const user = await UserService.getSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await request.json();
    const result = await OnboardingService.completeOnboarding(user.id, body);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to complete onboarding' }, { status: 400 });
  }
}
