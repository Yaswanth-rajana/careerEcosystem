import { z } from 'zod';
import { SignUpSchema, LoginSchema, ForgotPasswordSchema } from '@backend/validations/schemas';

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isOnboarded: boolean;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  user?: AuthUser;
  error?: string;
}

export interface GoogleAuthResponse {
  success?: boolean;
  user?: AuthUser;
  onboardingComplete?: boolean;
  redirectTo?: string;
  error?: string;
}

/**
 * Client-side authentication helper functions
 */
export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || 'Failed to sign in. Please check your credentials.' };
    }
    return { user: result.user };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred during sign in.' };
  }
}

export async function registerUser(data: SignUpInput): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || 'Failed to create account. Please try again.' };
    }
    return { user: result.user };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred during account creation.' };
  }
}

export async function resetPasswordRequest(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Failed to send password reset request.' };
    }
    return { success: true, message: result.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function loginWithGoogle(credential: string): Promise<GoogleAuthResponse> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || 'Google sign-in failed. Please try again.' };
    }
    return {
      success: true,
      user: result.user,
      onboardingComplete: result.onboardingComplete,
      redirectTo: result.redirectTo,
    };
  } catch (err: any) {
    return { error: err.message || 'We couldn\'t complete Google sign-in. Please try again.' };
  }
}

