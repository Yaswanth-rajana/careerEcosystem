import { cookies } from 'next/headers';
import { AdminAuthService, AuthenticatedAdmin, AdminAuthError } from '@backend/services/adminAuthService';
import { PermissionType } from '@backend/types/rbac';

export const ADMIN_COOKIE_NAME = 'pathway_admin_session';

export async function getAuthenticatedAdmin(requiredPermission?: PermissionType): Promise<AuthenticatedAdmin> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  const admin = await AdminAuthService.verifyAdmin(token);

  if (requiredPermission) {
    AdminAuthService.requirePermission(admin, requiredPermission);
  }

  return admin;
}
