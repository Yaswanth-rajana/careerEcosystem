import crypto from 'crypto';
import { db } from '../../db/client';
import { FileValidationService, ValidatedFileInfo } from './file-validation-service';
import { StorageFactory } from './storage-provider';
import { GotenbergConversionProvider } from './gotenberg-provider';
import { OutputValidationService } from './output-validation-service';
import { RateLimitService } from './rate-limit-service';
import { FILE_RETENTION_MINUTES } from './constants';
import { ToolError } from './errors';

export interface CreateConversionRequest {
  filename: string;
  buffer: Buffer;
  clientMimeType?: string;
  targetFormat?: string;
  userId?: string | null;
  clientIp?: string;
}

export interface ConversionResponseData {
  jobId: string;
  guestToken?: string;
  status: string;
  originalFilename: string;
  outputFilename: string;
  inputFormat: string;
  outputFormat: string;
  inputSize: number;
  outputSize?: number;
  processingTimeMs?: number;
  createdAt: string;
  expiresAt: string;
}

export class ConversionService {
  private static provider = new GotenbergConversionProvider();

  /**
   * Generates a secure random guest access token and its SHA-256 hash.
   */
  public static generateGuestToken(): { rawToken: string; hash: string } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    return { rawToken, hash };
  }

  /**
   * Hashes a raw token for lookup.
   */
  public static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Executes complete document conversion pipeline.
   */
  public static async convertDocument(req: CreateConversionRequest): Promise<ConversionResponseData> {
    const targetFormat = (req.targetFormat || 'pdf').toLowerCase();
    
    // 1. Rate Limit Enforcement
    const rateLimitId = req.userId || req.clientIp || 'anonymous';
    await RateLimitService.enforceRateLimit(rateLimitId, !!req.userId);

    // 2. Multi-stage File Validation
    const validatedInfo: ValidatedFileInfo = FileValidationService.validateIncomingFile(
      req.filename,
      req.buffer,
      req.clientMimeType,
      targetFormat
    );

    // 3. Health Check Conversion Provider
    const isHealthy = await this.provider.healthCheck();
    if (!isHealthy) {
      throw new ToolError('TOOL_UNAVAILABLE');
    }

    // 4. Setup Guest Security & Retention
    let guestToken: string | undefined;
    let guestTokenHash: string | null = null;

    if (!req.userId) {
      const tokenObj = this.generateGuestToken();
      guestToken = tokenObj.rawToken;
      guestTokenHash = tokenObj.hash;
    }

    const expiresAt = new Date(Date.now() + FILE_RETENTION_MINUTES * 60 * 1000);
    const storage = StorageFactory.getProvider();

    const baseOutputName = validatedInfo.sanitizedFilename.replace(/\.[^/.]+$/, '');
    const outputFilename = `${baseOutputName}.pdf`;

    // 5. Create ConversionJob record in DB
    const job = await db.conversionJob.create({
      data: {
        userId: req.userId || null,
        guestTokenHash,
        type: 'DOCUMENT_CONVERSION',
        sourceFormat: validatedInfo.extension,
        targetFormat,
        originalFilename: validatedInfo.originalFilename,
        outputFilename,
        inputSize: validatedInfo.sizeBytes,
        inputStorageKey: 'pending',
        status: 'PROCESSING',
        startedAt: new Date(),
        expiresAt,
      },
    });

    const inputKey = `${job.id}/input.${validatedInfo.extension}`;
    const outputKey = `${job.id}/output.pdf`;

    try {
      // 6. Store Input Payload
      await storage.upload(inputKey, req.buffer, validatedInfo.mimeType);
      await db.conversionJob.update({
        where: { id: job.id },
        data: { inputStorageKey: inputKey },
      });

      // 7. Execute Conversion via Provider
      const result = await this.provider.convertToPdf(req.buffer, {
        jobId: job.id,
        sourceFormat: validatedInfo.extension,
        targetFormat,
        originalFilename: validatedInfo.sanitizedFilename,
      });

      // 8. Output Validation
      const outputInfo = await OutputValidationService.validatePdfOutput(result.pdfBuffer, job.id, validatedInfo.extension);

      // 9. Store Output Payload
      await storage.upload(outputKey, result.pdfBuffer, 'application/pdf');

      // 10. Complete ConversionJob
      const completedJob = await db.conversionJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          outputStorageKey: outputKey,
          outputSize: outputInfo.sizeBytes,
          processingTimeMs: result.processingTimeMs,
          completedAt: new Date(),
        },
      });

      // Structured Logging
      console.log(`[CONVERSION_SUCCESS] Job ${job.id} converted ${validatedInfo.extension} -> pdf in ${result.processingTimeMs}ms (${outputInfo.sizeBytes} bytes)`);

      return {
        jobId: job.id,
        guestToken,
        status: completedJob.status,
        originalFilename: completedJob.originalFilename,
        outputFilename: completedJob.outputFilename || outputFilename,
        inputFormat: completedJob.sourceFormat,
        outputFormat: completedJob.targetFormat,
        inputSize: completedJob.inputSize,
        outputSize: completedJob.outputSize || outputInfo.sizeBytes,
        processingTimeMs: completedJob.processingTimeMs || result.processingTimeMs,
        createdAt: completedJob.createdAt.toISOString(),
        expiresAt: completedJob.expiresAt ? completedJob.expiresAt.toISOString() : expiresAt.toISOString(),
      };
    } catch (err: any) {
      const errorCode = err instanceof ToolError ? err.code : 'CONVERSION_FAILED';
      const errorMessage = err.message || 'Conversion failed';

      await db.conversionJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorCode,
          errorMessage,
          completedAt: new Date(),
        },
      }).catch(() => {});

      console.error(`[CONVERSION_FAILED] Job ${job.id} failed with code ${errorCode}: ${errorMessage}`);
      throw err;
    }
  }

  /**
   * Retrieves status of a conversion job.
   */
  public static async getJobStatus(jobId: string, userId?: string | null, guestToken?: string | null) {
    const job = await db.conversionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ToolError('JOB_NOT_FOUND');
    }

    this.verifyJobAccess(job, userId, guestToken);

    return {
      id: job.id,
      status: job.status,
      originalFilename: job.originalFilename,
      outputFilename: job.outputFilename,
      inputFormat: job.sourceFormat,
      outputFormat: job.targetFormat,
      inputSize: job.inputSize,
      outputSize: job.outputSize,
      processingTimeMs: job.processingTimeMs,
      errorCode: job.errorCode,
      errorMessage: job.status === 'FAILED' ? job.errorMessage : undefined,
      createdAt: job.createdAt.toISOString(),
      expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null,
    };
  }

  /**
   * Authorizes and streams/downloads converted output file.
   */
  public static async getDownloadStream(jobId: string, userId?: string | null, guestToken?: string | null) {
    const job = await db.conversionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ToolError('JOB_NOT_FOUND');
    }

    this.verifyJobAccess(job, userId, guestToken);

    if (job.status !== 'COMPLETED') {
      if (job.status === 'EXPIRED') {
        throw new ToolError('EXPIRED');
      }
      throw new ToolError('CONVERSION_FAILED', 'Document conversion is not ready or failed');
    }

    if (job.expiresAt && new Date() > job.expiresAt) {
      await db.conversionJob.update({
        where: { id: job.id },
        data: { status: 'EXPIRED' },
      }).catch(() => {});
      throw new ToolError('EXPIRED');
    }

    if (!job.outputStorageKey) {
      throw new ToolError('STORAGE_ERROR', 'Output storage key is missing');
    }

    const storage = StorageFactory.getProvider();
    const exists = await storage.exists(job.outputStorageKey);
    if (!exists) {
      throw new ToolError('EXPIRED', 'Output file no longer exists in temporary storage');
    }

    const fileBuffer = await storage.download(job.outputStorageKey);

    return {
      buffer: fileBuffer,
      filename: job.outputFilename || `${job.originalFilename}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: fileBuffer.length,
    };
  }

  /**
   * Verifies ownership or guest access token.
   */
  public static verifyJobAccess(job: any, userId?: string | null, guestToken?: string | null): void {
    // If job belongs to an authenticated user
    if (job.userId) {
      if (!userId || job.userId !== userId) {
        throw new ToolError('UNAUTHORIZED_ACCESS');
      }
      return;
    }

    // Guest job validation via SHA-256 token hash
    if (job.guestTokenHash) {
      if (!guestToken) {
        throw new ToolError('UNAUTHORIZED_ACCESS', 'Guest access token required');
      }
      const hashedProvided = this.hashToken(guestToken);
      if (hashedProvided !== job.guestTokenHash) {
        throw new ToolError('UNAUTHORIZED_ACCESS', 'Invalid guest access token');
      }
      return;
    }
  }

  /**
   * Deletes an active conversion job and temporary files if user owns it.
   */
  public static async cancelJob(jobId: string, userId?: string | null, guestToken?: string | null): Promise<void> {
    const job = await db.conversionJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    this.verifyJobAccess(job, userId, guestToken);

    const storage = StorageFactory.getProvider();
    if (job.inputStorageKey) await storage.delete(job.inputStorageKey).catch(() => {});
    if (job.outputStorageKey) await storage.delete(job.outputStorageKey).catch(() => {});

    await db.conversionJob.delete({ where: { id: jobId } }).catch(() => {});
  }
}
