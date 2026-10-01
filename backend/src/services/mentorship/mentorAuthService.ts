import { db } from '../../db/client';
import { UserService } from '../userService';
import { MentorStatus } from '../../types/admin';

export interface AuthenticatedMentor {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  };
  mentor: {
    id: string;
    userId: string | null;
    name: string;
    email: string;
    status: MentorStatus;
    domain: string;
    headline: string;
    avatar?: string | null;
  };
}

export class MentorAuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'MentorAuthError';
    this.statusCode = statusCode;
  }
}

export class MentorAuthService {
  /**
   * Verifies that the request comes from an authenticated mentor.
   * Server-side authorization check:
   * 1. Validates active session token.
   * 2. Resolves linked Mentor record by userId or email.
   * 3. Syncs userId onto Mentor if missing.
   * 4. Enforces mentor status check.
   */
  static async verifyMentor(token: string | null | undefined): Promise<AuthenticatedMentor> {
    if (!token) {
      throw new MentorAuthError('Authentication required. No session token provided.', 401);
    }

    const sessionUser = await UserService.getSession(token);
    if (!sessionUser) {
      throw new MentorAuthError('Session expired or invalid. Please sign in again.', 401);
    }

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
      throw new MentorAuthError('User record not found.', 401);
    }

    if (fullUser.status !== 'ACTIVE') {
      throw new MentorAuthError(`Your account is currently ${fullUser.status.toLowerCase()}. Access denied.`, 403);
    }

    // Resolve mentor record by userId or email
    let mentorRecord = await db.mentor.findFirst({
      where: {
        OR: [
          { userId: fullUser.id },
          { email: fullUser.email.toLowerCase() },
        ],
      },
    });

    if (!mentorRecord) {
      // If user has role CANDIDATE and no mentor record, deny access
      throw new MentorAuthError('Forbidden. No mentor profile exists for this account. Candidates cannot access the Mentor Portal.', 403);
    }

    // Auto-link userId if missing
    if (!mentorRecord.userId) {
      mentorRecord = await db.mentor.update({
        where: { id: mentorRecord.id },
        data: { userId: fullUser.id },
      });
    }

    return {
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        avatarUrl: fullUser.avatarUrl,
      },
      mentor: {
        id: mentorRecord.id,
        userId: mentorRecord.userId,
        name: mentorRecord.name,
        email: mentorRecord.email,
        status: mentorRecord.status as MentorStatus,
        domain: mentorRecord.domain,
        headline: mentorRecord.headline,
        avatar: mentorRecord.avatar,
      },
    };
  }

  /**
   * Enforces that the mentor is fully APPROVED for operational features.
   */
  static requireApproved(authenticatedMentor: AuthenticatedMentor): void {
    const { status } = authenticatedMentor.mentor;
    if (status === 'SUSPENDED') {
      throw new MentorAuthError('Your mentor account has been suspended by an administrator. Please contact support.', 403);
    }
    if (status === 'REJECTED') {
      throw new MentorAuthError('Your mentor application was not approved. Operational features are unavailable.', 403);
    }
    if (status === 'PENDING' || status === 'UNDER_REVIEW') {
      throw new MentorAuthError('Your mentor application is currently under review by administrators.', 403);
    }
  }

  /**
   * Enforces strict resource ownership to prevent IDOR attacks.
   */
  static verifyOwnership(authenticatedMentor: AuthenticatedMentor, resourceMentorId: string): void {
    if (authenticatedMentor.mentor.id !== resourceMentorId) {
      throw new MentorAuthError('Forbidden. You do not have permission to access or modify this mentor resource.', 403);
    }
  }
}
