import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { SavedJobService } from '@backend/services/savedJobService';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to save opportunities' }, { status: 401 });
    }

    const result = await SavedJobService.saveJob(user.id, params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Save job API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save job' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to manage saved opportunities' }, { status: 401 });
    }

    const result = await SavedJobService.unsaveJob(user.id, params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Unsave job API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove saved job' },
      { status: 400 }
    );
  }
}
