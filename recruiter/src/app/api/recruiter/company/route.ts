import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterCompanyService } from '@backend/services/recruiter/recruiterCompanyService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const profile = await RecruiterCompanyService.getCompanyProfile(auth.company.id);

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load company profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const updated = await RecruiterCompanyService.updateCompanyProfile(auth.company.id, body, auth);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update company profile' },
      { status: 400 }
    );
  }
}
