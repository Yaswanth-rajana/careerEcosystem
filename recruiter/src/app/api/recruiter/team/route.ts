import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterTeamService } from '@backend/services/recruiter/recruiterTeamService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const members = await RecruiterTeamService.listTeamMembers(auth.company.id);

    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const member = await RecruiterTeamService.inviteMember(auth.company.id, body, auth);
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to invite team member' },
      { status: 400 }
    );
  }
}
