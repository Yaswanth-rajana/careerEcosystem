import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterTeamService } from '@backend/services/recruiter/recruiterTeamService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const member = await RecruiterTeamService.updateMemberRole(
      auth.company.id,
      params.id,
      body,
      auth
    );

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update team member' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    await RecruiterTeamService.removeMember(auth.company.id, params.id, auth);

    return NextResponse.json({ success: true, message: 'Member deactivated' });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to deactivate team member' },
      { status: 400 }
    );
  }
}
