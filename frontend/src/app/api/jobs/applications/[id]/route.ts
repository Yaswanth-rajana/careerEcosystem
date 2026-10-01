import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { ApplicationService } from '@backend/services/applicationService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const application = await ApplicationService.getApplication(user.id, params.id);
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error('Application detail API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve application' },
      { status: 500 }
    );
  }
}
