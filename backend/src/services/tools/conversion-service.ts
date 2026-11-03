import crypto from 'crypto';
import { db } from '../../db/client';
import { FileValidationService, ValidatedFileInfo } from './file-validation-service';
import { StorageFactory, StorageKeyGenerator } from './storage-provider';
import { ConversionProviderFactory } from './provider-factory';
import { OutputValidationService } from './output-validation-service';
import { RateLimitService } from './rate-limit-service';
import { FILE_RETENTION_MINUTES, CLOUDCONVERT_WEBHOOK_SECRET } from './constants';
import { ToolError } from './errors';
import { CloudConvertConversionProvider } from './cloudconvert-provider';

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
  /**
   * Returns current active conversion provider via factory.
   */
  public static getProvider() {
    return ConversionProviderFactory.getProvider();
  }

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
   * Verifies ownership or guest access token.
   */
  public static verifyJobAccess(job: any, userId?: string | null, guestToken?: string | null): void {
    if (!job) {
      throw new ToolError('JOB_NOT_FOUND');
    }

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
   * Starts an asynchronous or direct conversion job.
   */
  public static async startConversion(req: CreateConversionRequest): Promise<ConversionResponseData> {
    const targetFormat = (req.targetFormat || 'pdf').toLowerCase();
    const provider = this.getProvider();

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
    const isHealthy = await provider.healthCheck();
    if (!isHealthy) {
      throw new ToolError('TOOL_UNAVAILABLE', `Conversion service (${provider.name}) is currently unavailable.`);
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

    const inputKey = StorageKeyGenerator.generateInputKey(job.id, validatedInfo.extension);
    const outputKey = StorageKeyGenerator.generateOutputKey(job.id);

    try {
      // 6. Store Input in private storage
      await storage.upload(inputKey, req.buffer, validatedInfo.mimeType);
      await db.conversionJob.update({
        where: { id: job.id },
        data: { inputStorageKey: inputKey },
      });

      // 7. If provider supports async jobs, initiate async job
      if (typeof provider.createAsyncJob === 'function') {
        const asyncResult = await provider.createAsyncJob(
          {
            jobId: job.id,
            sourceFormat: validatedInfo.extension,
            targetFormat,
            originalFilename: validatedInfo.sanitizedFilename,
            mimeType: validatedInfo.mimeType,
          },
          req.buffer
        );

        await db.conversionJob.update({
          where: { id: job.id },
          data: {
            providerJobId: asyncResult.providerJobId,
            status: 'PROCESSING',
          },
        });

        console.log(`[CONVERSION_ASYNC_INITIATED] Job ${job.id} dispatched to provider ${provider.name} (providerJobId: ${asyncResult.providerJobId})`);

        return {
          jobId: job.id,
          guestToken,
          status: 'PROCESSING',
          originalFilename: validatedInfo.originalFilename,
          outputFilename,
          inputFormat: validatedInfo.extension,
          outputFormat: targetFormat,
          inputSize: validatedInfo.sizeBytes,
          createdAt: job.createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };
      }

      // 8. Otherwise fallback to synchronous execution
      const startTime = Date.now();
      const result = await provider.convertToPdf(req.buffer, {
        jobId: job.id,
        sourceFormat: validatedInfo.extension,
        targetFormat,
        originalFilename: validatedInfo.sanitizedFilename,
        mimeType: validatedInfo.mimeType,
      });

      const outputInfo = await OutputValidationService.validatePdfOutput(
        result.pdfBuffer,
        job.id,
        validatedInfo.extension
      );

      await storage.upload(outputKey, result.pdfBuffer, 'application/pdf');

      const completedJob = await db.conversionJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          outputStorageKey: outputKey,
          outputSize: outputInfo.sizeBytes,
          processingTimeMs: result.processingTimeMs || (Date.now() - startTime),
          completedAt: new Date(),
        },
      });

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
   * Synchronous conversion pipeline (backward-compatible with existing callers).
   */
  public static async convertDocument(req: CreateConversionRequest): Promise<ConversionResponseData> {
    const provider = this.getProvider();

    // If provider is CloudConvert or Mock, convertToPdf handles end-to-end execution
    const targetFormat = (req.targetFormat || 'pdf').toLowerCase();
    const rateLimitId = req.userId || req.clientIp || 'anonymous';
    await RateLimitService.enforceRateLimit(rateLimitId, !!req.userId);

    const validatedInfo = FileValidationService.validateIncomingFile(
      req.filename,
      req.buffer,
      req.clientMimeType,
      targetFormat
    );

    const isHealthy = await provider.healthCheck();
    if (!isHealthy) {
      throw new ToolError('TOOL_UNAVAILABLE', `Document conversion service (${provider.name}) is currently unreachable.`);
    }

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

    const inputKey = StorageKeyGenerator.generateInputKey(job.id, validatedInfo.extension);
    const outputKey = StorageKeyGenerator.generateOutputKey(job.id);

    try {
      await storage.upload(inputKey, req.buffer, validatedInfo.mimeType);
      await db.conversionJob.update({
        where: { id: job.id },
        data: { inputStorageKey: inputKey },
      });

      const startTime = Date.now();
      const result = await provider.convertToPdf(req.buffer, {
        jobId: job.id,
        sourceFormat: validatedInfo.extension,
        targetFormat,
        originalFilename: validatedInfo.sanitizedFilename,
        mimeType: validatedInfo.mimeType,
      });

      const outputInfo = await OutputValidationService.validatePdfOutput(
        result.pdfBuffer,
        job.id,
        validatedInfo.extension
      );

      await storage.upload(outputKey, result.pdfBuffer, 'application/pdf');

      const completedJob = await db.conversionJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          outputStorageKey: outputKey,
          outputSize: outputInfo.sizeBytes,
          processingTimeMs: result.processingTimeMs || (Date.now() - startTime),
          completedAt: new Date(),
        },
      });

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
   * Retrieves status of a conversion job, polling provider if active.
   */
  public static async getJobStatus(jobId: string, userId?: string | null, guestToken?: string | null) {
    let job = await db.conversionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ToolError('JOB_NOT_FOUND');
    }

    this.verifyJobAccess(job, userId, guestToken);

    // If job is in PROCESSING state and has a providerJobId, query provider for status update
    if (job.status === 'PROCESSING' && job.providerJobId) {
      const provider = this.getProvider();

      if (typeof provider.getJobStatus === 'function') {
        try {
          const providerStatus = await provider.getJobStatus(job.providerJobId);

          if (providerStatus.status === 'COMPLETED' && providerStatus.outputUrl) {
            // Fetch converted PDF from provider
            const fetchFn = typeof provider.fetchConvertedPdf === 'function'
              ? provider.fetchConvertedPdf.bind(provider)
              : async (url: string) => {
                  const res = await fetch(url);
                  return Buffer.from(await res.arrayBuffer());
                };

            const pdfBuffer = await fetchFn(providerStatus.outputUrl);
            const outputInfo = await OutputValidationService.validatePdfOutput(
              pdfBuffer,
              job.id,
              job.sourceFormat
            );

            const outputKey = job.outputStorageKey && job.outputStorageKey !== 'pending'
              ? job.outputStorageKey
              : StorageKeyGenerator.generateOutputKey(job.id);

            const storage = StorageFactory.getProvider();
            await storage.upload(outputKey, pdfBuffer, 'application/pdf');

            const processingTimeMs = job.startedAt
              ? Math.max(1, Date.now() - new Date(job.startedAt).getTime())
              : providerStatus.processingTimeMs || 1000;

            job = await db.conversionJob.update({
              where: { id: job.id },
              data: {
                status: 'COMPLETED',
                outputStorageKey: outputKey,
                outputSize: outputInfo.sizeBytes,
                processingTimeMs,
                completedAt: new Date(),
              },
            });
          } else if (providerStatus.status === 'FAILED') {
            job = await db.conversionJob.update({
              where: { id: job.id },
              data: {
                status: 'FAILED',
                errorCode: providerStatus.errorCode || 'CONVERSION_FAILED',
                errorMessage: providerStatus.errorMessage || 'Conversion failed at provider',
                completedAt: new Date(),
              },
            });
          }
        } catch (err: any) {
          console.warn(`[CONVERSION_STATUS_POLL_ERROR] Error checking provider status for ${job.id}:`, err?.message || err);
          const currentRetries = (job.retryCount || 0) + 1;
          const isTimeout = job.startedAt && (Date.now() - new Date(job.startedAt).getTime() > 90_000);

          if (currentRetries >= 8 || isTimeout) {
            job = await db.conversionJob.update({
              where: { id: job.id },
              data: {
                status: 'FAILED',
                retryCount: currentRetries,
                errorCode: isTimeout ? 'CONVERSION_TIMEOUT' : 'CONVERSION_FAILED',
                errorMessage: isTimeout
                  ? 'The conversion process took too long. Please try converting a smaller document.'
                  : (err?.message || 'Unable to retrieve status from provider'),
                completedAt: new Date(),
              },
            });
          } else {
            await db.conversionJob.update({
              where: { id: job.id },
              data: { retryCount: currentRetries },
            });
          }
        }
      }
    }

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
   * Handles incoming authenticated provider webhook event (e.g. CloudConvert job.finished).
   */
  public static async handleWebhookEvent(
    rawBody: string | Buffer,
    signatureHeader: string | null | undefined
  ): Promise<{ handled: boolean; jobId?: string; status?: string }> {
    const secret = process.env.CLOUDCONVERT_WEBHOOK_SECRET || CLOUDCONVERT_WEBHOOK_SECRET;
    if (secret) {
      const isValid = CloudConvertConversionProvider.verifyWebhookSignature(
        rawBody,
        signatureHeader,
        secret
      );
      if (!isValid) {
        throw new ToolError('UNAUTHORIZED_ACCESS', 'Invalid webhook signature');
      }
    } else {
      // If signature is provided or secret is expected, reject unauthorized event
      throw new ToolError('UNAUTHORIZED_ACCESS', 'Webhook signature verification required');
    }

    const payload = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8'));
    const jobData = payload?.data?.job || payload?.data;
    const providerJobId = jobData?.id;
    const tag = jobData?.tag; // Our internal jobId

    if (!providerJobId && !tag) {
      return { handled: false };
    }

    const job = await db.conversionJob.findFirst({
      where: {
        OR: [
          tag ? { id: tag } : {},
          providerJobId ? { providerJobId } : {},
        ],
      },
    });

    if (!job) {
      return { handled: false };
    }

    // Idempotency: if already completed or expired, ignore duplicate event
    if (job.status === 'COMPLETED' || job.status === 'EXPIRED') {
      return { handled: true, jobId: job.id, status: job.status };
    }

    const eventStatus = jobData?.status;
    if (eventStatus === 'finished') {
      const exportTask = jobData?.tasks?.find((t: any) => t.operation === 'export/url' && t.status === 'finished');
      const outputUrl = exportTask?.result?.files?.[0]?.url;

      if (outputUrl) {
        const provider = this.getProvider();
        const fetchFn = typeof provider.fetchConvertedPdf === 'function'
          ? provider.fetchConvertedPdf.bind(provider)
          : async (url: string) => {
              const res = await fetch(url);
              return Buffer.from(await res.arrayBuffer());
            };

        const pdfBuffer = await fetchFn(outputUrl);
        const outputInfo = await OutputValidationService.validatePdfOutput(pdfBuffer, job.id, job.sourceFormat);

        const outputKey = job.outputStorageKey && job.outputStorageKey !== 'pending'
          ? job.outputStorageKey
          : StorageKeyGenerator.generateOutputKey(job.id);

        const storage = StorageFactory.getProvider();
        await storage.upload(outputKey, pdfBuffer, 'application/pdf');

        const processingTimeMs = job.startedAt
          ? Math.max(1, Date.now() - new Date(job.startedAt).getTime())
          : 1000;

        await db.conversionJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            outputStorageKey: outputKey,
            outputSize: outputInfo.sizeBytes,
            processingTimeMs,
            completedAt: new Date(),
          },
        });

        return { handled: true, jobId: job.id, status: 'COMPLETED' };
      }
    } else if (eventStatus === 'error') {
      const failedTask = jobData?.tasks?.find((t: any) => t.status === 'error');
      const errorMessage = failedTask?.message || jobData?.message || 'Webhook reported conversion failure';

      await db.conversionJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          errorCode: 'CONVERSION_FAILED',
          errorMessage,
          completedAt: new Date(),
        },
      });

      return { handled: true, jobId: job.id, status: 'FAILED' };
    }

    return { handled: true, jobId: job.id, status: job.status };
  }

  /**
   * Authorizes and downloads converted output file.
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
   * Deletes an active conversion job and temporary files if user owns it.
   */
  public static async cancelJob(jobId: string, userId?: string | null, guestToken?: string | null): Promise<void> {
    const job = await db.conversionJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    this.verifyJobAccess(job, userId, guestToken);

    const provider = this.getProvider();
    if (job.providerJobId && typeof provider.cancelJob === 'function') {
      await provider.cancelJob(job.providerJobId).catch(() => {});
    }

    const storage = StorageFactory.getProvider();
    if (job.inputStorageKey) await storage.delete(job.inputStorageKey).catch(() => {});
    if (job.outputStorageKey) await storage.delete(job.outputStorageKey).catch(() => {});

    await db.conversionJob.delete({ where: { id: jobId } }).catch(() => {});
  }
}
