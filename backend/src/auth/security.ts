import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;
export const SESSION_COOKIE_NAME = 'career_session';
export const SESSION_DURATION_DAYS = 7;

/**
 * Hashes a plain-text password using bcrypt with salt rounds = 12.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a plain-text password against a stored hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically secure random session token.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculates session expiration date.
 */
export function getSessionExpirationDate(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);
  return expires;
}

/**
 * Security headers & cookie configuration
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
};
