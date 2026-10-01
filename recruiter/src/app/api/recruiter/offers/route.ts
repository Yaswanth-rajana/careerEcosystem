import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { RecruiterOfferService } from '@backend/services/recruiter/recruiterOfferService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const offers = await RecruiterOfferService.listOffers(auth.company.id);

    return NextResponse.json({ success: true, data: offers });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedRecruiter();
    const body = await request.json();

    const offer = await RecruiterOfferService.createOffer(body, auth);
    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create offer' },
      { status: 400 }
    );
  }
}
