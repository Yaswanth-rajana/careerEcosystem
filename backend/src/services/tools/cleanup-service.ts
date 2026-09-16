import { db } from '../../db/client';
import { StorageFactory } from './storage-provider';
import { FILE_RETENTION_MINUTES, JOB_METADATA_RETENTION_HOURS } from './constants';

export class CleanupService {
  /**
   * Cleans up expired temporary files and marks jobs as EXPIRED.
   */
  public static async purgeExpiredFiles(): Promise<{ purgedCount: number; errors: number }> {
    const storage = StorageFactory.getProvider();
    const now = new Date();

    // Query active or completed jobs whose retention window has passed
    const expiredJobs = await db.conversionJob.findMany({
      where: {
        status: { in: ['COMPLETED', 'FAILED', 'PROCESSING', 'QUEUED'] },
        expiresAt: { lt: now },
      },
    });

    let purgedCount = 0;
    let errors = 0;

    for (const job of expiredJobs) {
      try {
        if (job.inputStorageKey) {
          await storage.delete(job.inputStorageKey).catch(() => {});
        }
        if (job.outputStorageKey) {
          await storage.delete(job.outputStorageKey).catch(() => {});
        }

        await db.conversionJob.update({
          where: { id: job.id },
          data: {
            status: 'EXPIRED',
          },
        });

        purgedCount++;
      } catch {
        errors++;
      }
    }

    return { purgedCount, errors };
  }

  /**
   * Purges old metadata records older than JOB_METADATA_RETENTION_HOURS (24 hours).
   */
  public static async purgeOldMetadata(): Promise<{ deletedCount: number }> {
    const cutoff = new Date(Date.now() - JOB_METADATA_RETENTION_HOURS * 60 * 60 * 1000);

    const result = await db.conversionJob.deleteMany({
      where: {
        createdAt: { lt: cutoff },
        status: 'EXPIRED',
      },
    });

    return { deletedCount: result.count };
  }

  /**
   * Run full cleanup job cycle.
   */
  public static async runCleanupCycle(): Promise<{ purgedFiles: number; purgedMetadata: number }> {
    const fileResult = await this.purgeExpiredFiles();
    const metaResult = await this.purgeOldMetadata();
    return {
      purgedFiles: fileResult.purgedCount,
      purgedMetadata: metaResult.deletedCount,
    };
  }
}
