import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { SessionService } from '@backend/services/mentorship/sessionService';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const sessionData = await SessionService.getSessionDetail(params.id, authMentor.mentor.id);
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(sessionData);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve session' },
      { status: err.statusCode || 403 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const body = await request.json();
    const updated = await SessionService.updateSessionNotes(
      params.id,
      authMentor.mentor.id,
      body
    );
    return NextResponse.json({ session: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update session' },
      { status: err.statusCode || 400 }
    );
  }
}
