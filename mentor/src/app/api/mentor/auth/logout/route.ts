import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { MENTOR_COOKIE_NAME, CANDIDATE_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(MENTOR_COOKIE_NAME)?.value || cookieStore.get(CANDIDATE_COOKIE_NAME)?.value;

    if (token) {
      await UserService.logoutSession(token);
    }

    cookieStore.delete(MENTOR_COOKIE_NAME);
    cookieStore.delete(CANDIDATE_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Logout failed' }, { status: 500 });
  }
}
