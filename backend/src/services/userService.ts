import { db } from '../db/client';
import { hashPassword, comparePassword, generateSecureToken, getSessionExpirationDate } from '../auth/security';
import { SignUpSchema, LoginSchema } from '../validations/schemas';

export class UserService {
  /**
   * Registers a new user with hashed password & profile initialization.
   */
  static async registerUser(data: { name: string; email: string; password: string; role?: string }) {
    const validated = SignUpSchema.parse(data);

    const existing = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        role: validated.role || 'CANDIDATE',
        isOnboarded: false,
        profile: {
          create: {
            candidateType: 'STUDENT',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = await this.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
      },
      token,
    };
  }

  /**
   * Authenticates user login credentials.
   */
  static async authenticateUser(data: { email: string; password: string }) {
    const validated = LoginSchema.parse(data);

    const user = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email address or password.');
    }

    if (!user.passwordHash) {
      throw new Error('This account was created with Google. Please sign in using Google.');
    }

    const isValidPassword = await comparePassword(validated.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email address or password.');
    }

    const token = await this.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
      },
      token,
    };
  }

  /**
   * Authenticates or registers a user via verified Google identity.
   * Performs safe account linking if verified email matches an existing account.
   */
  static async authenticateWithGoogle(data: {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    avatarUrl?: string | null;
  }) {
    if (!data.emailVerified) {
      throw new Error('Google email is not verified.');
    }

    if (!data.googleId) {
      throw new Error('Missing Google account identifier.');
    }

    const email = data.email.toLowerCase().trim();

    // 1. First check if a user with this googleId already exists
    let user = await db.user.findFirst({
      where: { googleId: data.googleId },
    });

    if (user) {
      const token = await this.createSession(user.id);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isOnboarded: user.isOnboarded,
          avatarUrl: user.avatarUrl,
        },
        token,
      };
    }

    // 2. Check if a user exists with the same verified email
    const existingByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      // Safe account linking:
      // If already linked to another Google ID, reject
      if (existingByEmail.googleId && existingByEmail.googleId !== data.googleId) {
        throw new Error('This email address is already linked to a different Google account.');
      }

      // Link Google account without modifying passwordHash
      user = await db.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: data.googleId,
          ...(data.avatarUrl && !existingByEmail.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
        },
      });
    } else {
      // 3. Brand new user registration via Google
      user = await db.user.create({
        data: {
          email,
          name: data.name || email.split('@')[0],
          googleId: data.googleId,
          provider: 'google',
          avatarUrl: data.avatarUrl || null,
          role: 'CANDIDATE',
          isOnboarded: false,
          profile: {
            create: {
              candidateType: 'STUDENT',
            },
          },
        },
        include: {
          profile: true,
        },
      });
    }

    const token = await this.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  /**
   * Creates a session token in the database.
   */
  static async createSession(userId: string): Promise<string> {
    const token = generateSecureToken();
    const expiresAt = getSessionExpirationDate();

    await db.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Retrieves an active user session by token.
   */
  static async getSession(token: string) {
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isOnboarded: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!session) return null;

    if (new Date() > session.expiresAt) {
      await db.session.deleteMany({ where: { token } }).catch(() => {});
      return null;
    }

    return session.user;
  }

  /**
   * Destroys a user session token safely.
   */
  static async logoutSession(token: string) {
    if (!token) return;
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
}
