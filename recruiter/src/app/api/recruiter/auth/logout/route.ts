import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { RECRUITER_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get(RECRUITER_COOKIE_NAME)?.value;

  if (token) {
    await UserService.logoutSession(token).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(RECRUITER_COOKIE_NAME);

  return response;
}
