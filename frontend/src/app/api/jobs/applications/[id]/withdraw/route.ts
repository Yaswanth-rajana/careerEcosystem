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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const application = await ApplicationService.withdrawApplication(user.id, params.id);

    return NextResponse.json({
      success: true,
      message: 'Application successfully withdrawn',
      application,
    });
  } catch (error: any) {
    console.error('Withdraw application API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to withdraw application' },
      { status: 400 }
    );
  }
}
