import { ToolError } from './errors';

export interface RateLimitCheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export interface RateLimitProvider {
  checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<RateLimitCheckResult>;
}

export class MemoryRateLimitProvider implements RateLimitProvider {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  public async checkRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitCheckResult> {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetMs: windowMs,
      };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetMs: Math.max(0, record.resetAt - now),
      };
    }

    record.count += 1;
    return {
      allowed: true,
      limit,
      remaining: limit - record.count,
      resetMs: Math.max(0, record.resetAt - now),
    };
  }
}

export class RateLimitService {
  private static provider: RateLimitProvider = new MemoryRateLimitProvider();

  public static setProvider(provider: RateLimitProvider): void {
    this.provider = provider;
  }

  /**
   * Enforces conversion rate limits.
   * Authenticated: 5 requests / min
   * Guest: 3 requests / min
   */
  public static async enforceRateLimit(identifier: string, isAuthenticated: boolean): Promise<RateLimitCheckResult> {
    const limit = isAuthenticated ? 5 : 3;
    const windowMs = 60 * 1000; // 1 minute window

    const result = await this.provider.checkRateLimit(`tools:conversion:${identifier}`, limit, windowMs);
    
    if (!result.allowed) {
      throw new ToolError('RATE_LIMITED');
    }

    return result;
  }
}
