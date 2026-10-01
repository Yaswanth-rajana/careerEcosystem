import crypto from 'crypto';
import { db } from '../db/client';
import { hashPassword } from '../auth/security';
import { UserService } from './userService';
import { AuditService } from './auditService';

export class PasswordSetupTokenService {
  private static readonly EXPIRY_HOURS = 24;

  /**
   * Hashes a raw token string using SHA-256 so raw tokens are NEVER stored in the database.
   */
  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a cryptographically random, single-use, 24-hour setup token.
   * Invalidates any previously issued unconsumed tokens for this user.
   */
  static async createSetupToken(userId: string): Promise<{ rawToken: string; expiresAt: Date }> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.EXPIRY_HOURS);

    // Invalidate existing pending tokens for this user
    await db.passwordSetupToken.updateMany({
      where: {
        userId,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Store only the token hash
    await db.passwordSetupToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        usedAt: null,
      },
    });

    return {
      rawToken,
      expiresAt,
    };
  }

  /**
   * Verifies if a token is valid, unconsumed, and not expired.
   */
  static async verifyToken(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      return { valid: false, error: 'Invalid token format.' };
    }

    const tokenHash = this.hashToken(rawToken);

    const tokenRecord = await db.passwordSetupToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      return { valid: false, error: 'Password setup link is invalid or has already been used.' };
    }

    if (tokenRecord.usedAt) {
      return { valid: false, error: 'This password setup link has already been used.' };
    }

    if (new Date() > tokenRecord.expiresAt) {
      return { valid: false, error: 'This password setup link has expired (valid for 24 hours). Please request a new link.' };
    }

    if (tokenRecord.user.status !== 'ACTIVE') {
      return { valid: false, error: 'This account is currently inactive.' };
    }

    return {
      valid: true,
      tokenRecord,
      user: tokenRecord.user,
    };
  }

  /**
   * Consumes a setup token and safely establishes the user's password.
   */
  static async consumeSetupToken(rawToken: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const verification = await this.verifyToken(rawToken);
    if (!verification.valid || !verification.tokenRecord || !verification.user) {
      throw new Error(verification.error || 'Invalid or expired setup token.');
    }

    const user = verification.user;
    const tokenRecord = verification.tokenRecord;

    // Hash password with bcrypt salt rounds = 12
    const passwordHash = await hashPassword(newPassword);

    // Atomically update user and mark token consumed
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    await db.passwordSetupToken.update({
      where: { id: tokenRecord.id },
      data: {
        usedAt: new Date(),
      },
    });

    // Create active session
    const sessionToken = await UserService.createSession(user.id);

    // Audit log
    await AuditService.log({
      actorId: user.id,
      actorEmail: user.email,
      actorName: user.name,
      action: 'MENTOR_PASSWORD_SETUP_COMPLETED',
      resourceType: 'USER',
      resourceId: user.id,
      details: { email: user.email },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      sessionToken,
    };
  }
}
