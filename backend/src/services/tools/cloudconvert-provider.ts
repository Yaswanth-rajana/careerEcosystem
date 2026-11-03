import crypto from 'crypto';
import {
  CLOUDCONVERT_API_KEY,
  CLOUDCONVERT_API_URL,
  CONVERSION_TIMEOUT_MS,
  SUPPORTED_CONVERSIONS,
} from './constants';
import {
  ConversionProvider,
  ConversionOptions,
  ConversionResult,
  AsyncJobCreationResult,
  ProviderJobStatusResult,
} from './conversion-provider';
import { ToolError } from './errors';

export interface CloudConvertJobTask {
  id: string;
  name: string;
  operation: string;
  status: 'waiting' | 'processing' | 'finished' | 'error';
  message?: string;
  code?: string;
  result?: {
    form?: {
      url: string;
      parameters: Record<string, any>;
    };
    files?: Array<{
      filename: string;
      url: string;
      size?: number;
    }>;
  };
}

export interface CloudConvertJobResponse {
  data: {
    id: string;
    status: 'waiting' | 'processing' | 'finished' | 'error';
    tasks: CloudConvertJobTask[];
    message?: string;
  };
}

export class CloudConvertConversionProvider implements ConversionProvider {
  public readonly name = 'cloudconvert';
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(apiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey || CLOUDCONVERT_API_KEY;
    this.apiUrl = (apiUrl || CLOUDCONVERT_API_URL).replace(/\/$/, '');
  }

  public supports(sourceFormat: string, targetFormat: string): boolean {
    const src = sourceFormat.toLowerCase();
    const tgt = targetFormat.toLowerCase();
    const allowed = SUPPORTED_CONVERSIONS[src];
    return !!allowed && allowed.includes(tgt);
  }

  /**
   * Checks CloudConvert API credentials and account health.
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${this.apiUrl}/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verifies an incoming webhook payload using the CloudConvert-Signature HMAC-SHA256 header.
   */
  public static verifyWebhookSignature(
    rawBody: string | Buffer,
    signatureHeader: string | null | undefined,
    secret: string
  ): boolean {
    if (!signatureHeader || !secret) {
      return false;
    }

    try {
      const computed = crypto
        .createHmac('sha256', secret)
        .update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody)
        .digest('hex');

      const expectedBuf = Buffer.from(signatureHeader, 'hex');
      const computedBuf = Buffer.from(computed, 'hex');

      if (expectedBuf.length !== computedBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuf, computedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Creates an asynchronous CloudConvert Job consisting of:
   * 1. import/upload task
   * 2. convert task (to PDF)
   * 3. export/url task
   *
   * If an inputBuffer is provided, uploads it directly to the CloudConvert upload form.
   */
  public async createAsyncJob(
    options: ConversionOptions,
    inputBuffer?: Buffer
  ): Promise<AsyncJobCreationResult> {
    if (!this.apiKey) {
      throw new ToolError(
        'TOOL_UNAVAILABLE',
        'CloudConvert API key is not configured. Please set CLOUDCONVERT_API_KEY.'
      );
    }

    if (!this.supports(options.sourceFormat, options.targetFormat)) {
      throw new ToolError('UNSUPPORTED_CONVERSION');
    }

    const payload = {
      tasks: {
        'import-source': {
          operation: 'import/upload',
        },
        'convert-to-pdf': {
          operation: 'convert',
          input: 'import-source',
          output_format: 'pdf',
          engine: 'libreoffice',
        },
        'export-pdf': {
          operation: 'export/url',
          input: 'convert-to-pdf',
        },
      },
      tag: options.jobId,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let jobRes: CloudConvertJobResponse;
    try {
      const response = await fetch(`${this.apiUrl}/jobs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[CLOUDCONVERT_JOB_CREATE_ERROR] HTTP ${response.status}: ${errorText}`);
        if (response.status === 401 || response.status === 403) {
          throw new ToolError('TOOL_UNAVAILABLE', 'CloudConvert authentication failure');
        }
        if (response.status === 429) {
          throw new ToolError('RATE_LIMITED', 'CloudConvert conversion rate limit reached');
        }
        throw new ToolError('CONVERSION_FAILED', `CloudConvert failed to create job: ${errorText.substring(0, 150)}`);
      }

      jobRes = (await response.json()) as CloudConvertJobResponse;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ToolError) throw err;
      throw new ToolError('TOOL_UNAVAILABLE', `CloudConvert service unreachable: ${err.message}`);
    }

    const providerJobId = jobRes.data.id;
    const uploadTask = jobRes.data.tasks.find((t) => t.operation === 'import/upload');
    const uploadForm = uploadTask?.result?.form;

    // If file buffer is provided, execute upload immediately
    if (inputBuffer && uploadForm?.url) {
      await this.uploadBufferToForm(
        uploadForm.url,
        uploadForm.parameters || {},
        inputBuffer,
        options.originalFilename,
        options.mimeType
      );
    }

    return {
      providerJobId,
      status: 'PROCESSING',
      uploadUrl: uploadForm?.url,
      uploadParameters: uploadForm?.parameters,
    };
  }

  /**
   * Uploads raw buffer to CloudConvert presigned storage form URL.
   */
  public async uploadBufferToForm(
    formUrl: string,
    formParameters: Record<string, any>,
    buffer: Buffer,
    filename: string,
    mimeType?: string
  ): Promise<void> {
    const formData = new FormData();

    for (const [key, value] of Object.entries(formParameters)) {
      formData.append(key, String(value));
    }

    const blob = new Blob([buffer as unknown as BlobPart], {
      type: mimeType || 'application/octet-stream',
    });
    formData.append('file', blob, filename);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(formUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new ToolError('CONVERSION_FAILED', `Failed to upload file to CloudConvert storage (${response.status}): ${text.substring(0, 150)}`);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ToolError) throw err;
      throw new ToolError('CONVERSION_FAILED', `Error uploading file to CloudConvert: ${err.message}`);
    }
  }

  /**
   * Retrieves live job status from CloudConvert API.
   */
  public async getJobStatus(providerJobId: string): Promise<ProviderJobStatusResult> {
    if (!this.apiKey) {
      throw new ToolError('TOOL_UNAVAILABLE', 'CloudConvert API key missing');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${this.apiUrl}/jobs/${providerJobId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 404) {
          throw new ToolError('JOB_NOT_FOUND', 'CloudConvert job not found');
        }
        throw new ToolError('CONVERSION_FAILED', `CloudConvert status check error: HTTP ${response.status}`);
      }

      const json = (await response.json()) as CloudConvertJobResponse;
      const jobData = json.data;

      if (jobData.status === 'finished') {
        const exportTask = jobData.tasks.find((t) => t.operation === 'export/url' && t.status === 'finished');
        const outputUrl = exportTask?.result?.files?.[0]?.url;

        return {
          providerJobId,
          status: 'COMPLETED',
          outputUrl,
        };
      }

      if (jobData.status === 'error') {
        const failedTask = jobData.tasks.find((t) => t.status === 'error');
        const errorMsg = failedTask?.message || jobData.message || 'CloudConvert conversion error';
        const isCorrupt = errorMsg.toLowerCase().includes('corrupt') ||
          errorMsg.toLowerCase().includes('password') ||
          errorMsg.toLowerCase().includes('cannot read');

        return {
          providerJobId,
          status: 'FAILED',
          errorCode: isCorrupt ? 'CORRUPTED_FILE' : 'CONVERSION_FAILED',
          errorMessage: errorMsg,
        };
      }

      return {
        providerJobId,
        status: 'PROCESSING',
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ToolError) throw err;
      throw new ToolError('CONVERSION_FAILED', `Error polling CloudConvert status: ${err.message}`);
    }
  }

  /**
   * Downloads output PDF from CloudConvert temporary export URL with security validation.
   */
  public async fetchConvertedPdf(outputUrl: string, timeoutMs = 20000): Promise<Buffer> {
    if (!outputUrl || typeof outputUrl !== 'string') {
      throw new ToolError('OUTPUT_VALIDATION_FAILED', 'Invalid export URL provided');
    }

    // SSRF & origin security validation: Ensure URL is HTTPS and points to trusted CloudConvert domains
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(outputUrl);
    } catch {
      throw new ToolError('OUTPUT_VALIDATION_FAILED', 'Malformed CloudConvert output URL');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new ToolError('OUTPUT_VALIDATION_FAILED', 'CloudConvert output URL must use HTTPS');
    }

    const allowedHosts = [
      'cloudconvert.com',
      'storage.cloudconvert.com',
      'storage.sandbox.cloudconvert.com',
    ];
    const isAllowedHost = allowedHosts.some(
      (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
    );

    if (!isAllowedHost) {
      throw new ToolError(
        'OUTPUT_VALIDATION_FAILED',
        `Untrusted output origin: ${parsedUrl.hostname}`
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(outputUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new ToolError('OUTPUT_VALIDATION_FAILED', `Failed to download converted PDF (HTTP ${response.status})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      if (pdfBuffer.length < 5 || pdfBuffer.slice(0, 5).toString('ascii') !== '%PDF-') {
        throw new ToolError('OUTPUT_VALIDATION_FAILED', 'Downloaded document is not a valid PDF (%PDF- header missing)');
      }

      return pdfBuffer;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ToolError) throw err;
      throw new ToolError('OUTPUT_VALIDATION_FAILED', `Failed to fetch converted PDF: ${err.message}`);
    }
  }

  /**
   * Cancels a CloudConvert job.
   */
  public async cancelJob(providerJobId: string): Promise<void> {
    if (!this.apiKey || !providerJobId) return;

    try {
      await fetch(`${this.apiUrl}/jobs/${providerJobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    } catch {
      // Ignore cancellation failures
    }
  }

  /**
   * Synchronous end-to-end conversion wrapper (creates job, uploads, polls until completion, downloads).
   */
  public async convertToPdf(
    inputBuffer: Buffer,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || CONVERSION_TIMEOUT_MS;

    const job = await this.createAsyncJob(options, inputBuffer);
    const deadline = Date.now() + timeoutMs;
    let pollInterval = 1000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, pollInterval));

      const status = await this.getJobStatus(job.providerJobId);

      if (status.status === 'COMPLETED' && status.outputUrl) {
        const pdfBuffer = await this.fetchConvertedPdf(status.outputUrl);
        return {
          pdfBuffer,
          processingTimeMs: Date.now() - startTime,
        };
      }

      if (status.status === 'FAILED') {
        throw new ToolError(
          (status.errorCode as any) || 'CONVERSION_FAILED',
          status.errorMessage || 'CloudConvert conversion failed'
        );
      }

      // Slightly backoff polling up to 3s
      pollInterval = Math.min(3000, pollInterval + 500);
    }

    // Timeout reached
    await this.cancelJob(job.providerJobId).catch(() => {});
    throw new ToolError('CONVERSION_TIMEOUT', 'CloudConvert conversion timed out');
  }
}
