import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorshipServiceManager } from '@backend/services/mentorship/mentorshipService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const services = await MentorshipServiceManager.listServicesByMentor(authMentor.mentor.id, false);
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list mentorship services' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const body = await request.json();
    const service = await MentorshipServiceManager.createService(authMentor.mentor.id, body);
    return NextResponse.json({ service }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create mentorship service' },
      { status: err.statusCode || 400 }
    );
  }
}
