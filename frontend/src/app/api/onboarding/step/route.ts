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
    const { stepNumber, payload } = body;

    if (!stepNumber || typeof stepNumber !== 'number') {
      return NextResponse.json({ error: 'Invalid step number' }, { status: 400 });
    }

    const updatedState = await OnboardingService.saveStepData(user.id, stepNumber, payload);
    return NextResponse.json(updatedState);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
