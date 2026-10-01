import { UserService } from './userService';
import { db } from '../db/client';
import { PermissionType, hasPermission, isAdminRole } from '../types/rbac';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
}

export class AdminAuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'AdminAuthError';
    this.statusCode = statusCode;
  }
}

export class AdminAuthService {
  /**
   * Verifies that the provided session token belongs to an active administrator.
   * Throws 401 if unauthenticated, 403 if unauthorized or account is suspended.
   */
  static async verifyAdmin(token: string | null | undefined): Promise<AuthenticatedAdmin> {
    if (!token) {
      throw new AdminAuthError('Authentication required. No session provided.', 401);
    }

    const sessionUser = await UserService.getSession(token);
    if (!sessionUser) {
      throw new AdminAuthError('Session expired or invalid. Please sign in again.', 401);
    }

    // Verify account status in database
    const fullUser = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    });

    if (!fullUser) {
      throw new AdminAuthError('User record not found.', 401);
    }

    if (fullUser.status !== 'ACTIVE') {
      throw new AdminAuthError(`Your account is currently ${fullUser.status.toLowerCase()}. Access denied.`, 403);
    }

    if (!isAdminRole(fullUser.role)) {
      throw new AdminAuthError('Forbidden. Administrative privileges required to access this resource.', 403);
    }

    return {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      status: fullUser.status,
      avatarUrl: fullUser.avatarUrl,
    };
  }

  /**
   * Enforces specific RBAC permission check.
   * Throws 403 if admin role lacks the required permission.
   */
  static requirePermission(admin: AuthenticatedAdmin, permission: PermissionType): void {
    if (!hasPermission(admin.role, permission)) {
      throw new AdminAuthError(`Forbidden. Permission '${permission}' is required to perform this action.`, 403);
    }
  }
}
