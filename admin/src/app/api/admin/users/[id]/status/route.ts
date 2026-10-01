import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { AdminUserService } from '@backend/services/adminUserService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.USERS_UPDATE);
    const body = await request.json();

    const updated = await AdminUserService.updateUserStatus(params.id, body, admin);
    return NextResponse.json({ user: updated });
  } catch (err: any) {
    const status = err.statusCode || (err.name === 'ZodError' ? 422 : 400);
    return NextResponse.json({ error: err.message || 'Failed to update user status' }, { status });
  }
}
