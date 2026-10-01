import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { ProfileService } from '@backend/services/profileService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
    }

    await ProfileService.changePassword(user.id, currentPassword, newPassword);
    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update password' },
      { status: 400 }
    );
  }
}
