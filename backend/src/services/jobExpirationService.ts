import { db } from '../db/client';

export class JobExpirationService {
  /**
   * The canonical lifespan of a published job in days.
   */
  static readonly EXPIRATION_DAYS = 30;

  /**
   * 30 days in milliseconds: 30 * 24 * 60 * 60 * 1000 = 2,592,000,000 ms.
   */
  static readonly EXPIRATION_MS = JobExpirationService.EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

  /**
   * Calculates the UTC cutoff threshold for 30-day expiration.
   * Jobs published at or before this threshold are expired.
   * Jobs published strictly after this threshold are active.
   */
  static getExpirationThreshold(now: Date = new Date()): Date {
    return new Date(now.getTime() - this.EXPIRATION_MS);
  }

  /**
   * Calculates the exact expiration date for a job published at `publishedAt`.
   */
  static calculateExpiresAt(publishedAt: Date): Date {
    return new Date(publishedAt.getTime() + this.EXPIRATION_MS);
  }

  /**
   * Evaluates if a job is expired based on its status and publication timestamp.
   * A job is considered expired when:
   * 1. Its status is explicitly 'EXPIRED'
   * 2. OR its status is 'PUBLISHED' and now >= publishedAt + 30 days (or now >= expiresAt)
   *
   * @param job Job record or partial job object
   * @param now Current timestamp for deterministic evaluation
   */
  static isJobExpired(
    job: {
      status?: string | null;
      publishedAt?: Date | string | null;
      createdAt?: Date | string | null;
      expiresAt?: Date | string | null;
    } | null | undefined,
    now: Date = new Date()
  ): boolean {
    if (!job) return true;

    // Explicit lifecycle status
    if (job.status === 'EXPIRED') {
      return true;
    }

    // Only PUBLISHED jobs are subject to candidate visibility & 30-day active lifespan
    if (job.status !== 'PUBLISHED') {
      return false;
    }

    // If explicit expiresAt timestamp exists, compare directly
    if (job.expiresAt) {
      const expDate = new Date(job.expiresAt);
      if (!isNaN(expDate.getTime())) {
        return now.getTime() >= expDate.getTime();
      }
    }

    // Canonical publication timestamp: prefer publishedAt, fallback to createdAt for legacy published jobs
    const pubDate = job.publishedAt
      ? new Date(job.publishedAt)
      : job.createdAt
      ? new Date(job.createdAt)
      : null;

    if (!pubDate || isNaN(pubDate.getTime())) {
      // If a published job lacks any valid timestamp, treat as expired/unverifiable
      return true;
    }

    // Boundary rule: expired when now >= publishedAt + 30 days
    return now.getTime() >= pubDate.getTime() + this.EXPIRATION_MS;
  }

  /**
   * Scheduled backend process to idempotently transition stale PUBLISHED jobs to EXPIRED.
   *
   * Criteria:
   * - status = PUBLISHED
   * - publishedAt <= now - 30 days (or expiresAt <= now)
   *
   * Idempotency guarantee: Running this multiple times causes no duplicate side effects
   * and preserves all applications, recruiter history, and analytics.
   */
  static async expireOldJobs(now: Date = new Date()): Promise<{
    success: boolean;
    updatedCount: number;
    threshold: string;
    timestamp: string;
  }> {
    const threshold = this.getExpirationThreshold(now);

    const result = await db.job.updateMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { publishedAt: { lte: threshold } },
          { expiresAt: { lte: now } },
          { publishedAt: null, createdAt: { lte: threshold } },
        ],
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return {
      success: true,
      updatedCount: result.count,
      threshold: threshold.toISOString(),
      timestamp: now.toISOString(),
    };
  }
}
