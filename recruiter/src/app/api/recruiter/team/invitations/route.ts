import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterTeamService } from '@backend/services/recruiter/recruiterTeamService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const invitations = await RecruiterTeamService.listInvitations(auth.company.id, auth);

    return NextResponse.json({ success: true, data: invitations });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list invitations' },
      { status: 500 }
    );
  }
}
