import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { ApplicationService } from '@backend/services/applicationService';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to apply for this position' }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const application = await ApplicationService.applyToJob(user.id, params.id, body);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error: any) {
    console.error('Job application API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit application' },
      { status: 400 }
    );
  }
}
