import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await UserService.logoutSession(token);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
