import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedRecruiter, RECRUITER_COOKIE_NAME } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(RECRUITER_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, recruiter: null }, { status: 200 });
  }

  try {
    const recruiterData = await getAuthenticatedRecruiter();
    return NextResponse.json({
      authenticated: true,
      recruiter: recruiterData,
    });
  } catch (err: any) {
    const response = NextResponse.json({ authenticated: false, recruiter: null }, { status: 200 });
    // Clear stale or invalid recruiter cookie
    response.cookies.delete(RECRUITER_COOKIE_NAME);
    return response;
  }
}
