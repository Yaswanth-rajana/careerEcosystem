import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterOfferService } from '@backend/services/recruiter/recruiterOfferService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const { status } = body;
    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = await RecruiterOfferService.updateOfferStatus(
      params.id,
      auth.company.id,
      status,
      auth
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update offer' },
      { status: 400 }
    );
  }
}
