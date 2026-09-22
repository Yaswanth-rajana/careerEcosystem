import { createRemoteJWKSet, jwtVerify } from 'jose';

const GOOGLE_JWKS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs');
const googleJWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string | null;
}

/**
 * Verifies a Google ID Token (JWT) server-side.
 * Enforces RS256 algorithm, Google issuers, audience match, expiration,
 * and extracts trusted claims (sub, email, email_verified, name, picture).
 */
export async function verifyGoogleIdToken(
  idToken: string,
  clientIdOverride?: string
): Promise<VerifiedGoogleUser> {
  const clientId =
    clientIdOverride ||
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('Google OAuth Client ID is not configured on the server.');
  }

  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Invalid token: Google credential must be a non-empty string.');
  }

  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
    algorithms: ['RS256'],
  });

  if (!payload.sub) {
    throw new Error('Missing Google subject (sub) claim.');
  }

  if (!payload.email || typeof payload.email !== 'string') {
    throw new Error('Google account has no email claim.');
  }

  if (payload.email_verified !== true) {
    throw new Error('Google email is not verified.');
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase().trim(),
    emailVerified: true,
    name: (payload.name as string) || payload.email.split('@')[0],
    givenName: payload.given_name as string | undefined,
    familyName: payload.family_name as string | undefined,
    picture: (payload.picture as string) || null,
  };
}
