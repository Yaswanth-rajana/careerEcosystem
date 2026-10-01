import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { EmployerApplicationService } from '@backend/services/recruiter/employerApplicationService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    let authenticatedUser: any = null;

    if (token) {
      authenticatedUser = await UserService.getSession(token).catch(() => null);
    }

    const body = await request.json();

    const result = await EmployerApplicationService.submitApplication(body, authenticatedUser);

    if (result.alreadyApproved) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const firstError = err.errors?.[0]?.message || 'Validation error';
      return NextResponse.json({ error: firstError, details: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while submitting your employer application.' },
      { status: 400 }
    );
  }
}
