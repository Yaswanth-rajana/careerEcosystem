import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { db } from './db/client';
import { UserService } from './services/userService';
import { SESSION_COOKIE_NAME } from './auth/security';
import { ConversionService } from './services/tools/conversion-service';
import { PdfToolsService } from './services/tools/pdf-tools-service';
import { ConversionProviderFactory } from './services/tools/provider-factory';
import { CleanupService } from './services/tools/cleanup-service';
import { ToolError } from './services/tools/errors';
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
} from './services/tools/constants';

/**
 * Concurrency Limiter (FIFO Semaphore)
 * On t3.small (2 GiB RAM), Gotenberg / LibreOffice conversions must run strictly
 * one at a time to prevent Linux OOM-killer crashes.
 */
class AsyncSemaphore {
  private readonly maxConcurrency: number;
  private currentRunning: number = 0;
  private readonly queue: Array<() => void> = [];

  constructor(maxConcurrency: number = 1) {
    this.maxConcurrency = maxConcurrency;
  }

  async acquire(): Promise<void> {
    if (this.currentRunning < this.maxConcurrency) {
      this.currentRunning++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.currentRunning = Math.max(0, this.currentRunning - 1);
    }
  }

  get runningCount(): number {
    return this.currentRunning;
  }

  get queuedCount(): number {
    return this.queue.length;
  }
}

const gotenbergSemaphore = new AsyncSemaphore(1);

// Environment validation
function validateEnvironment(): void {
  const issues: string[] = [];

  if (!process.env.DATABASE_URL) {
    issues.push('DATABASE_URL is missing. Database job tracking and session auth will fail.');
  }

  const provider = process.env.CONVERSION_PROVIDER || 'gotenberg';
  if (provider === 'gotenberg' && !process.env.GOTENBERG_URL) {
    issues.push('GOTENBERG_URL is not set (defaulting to http://localhost:3001).');
  }

  const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN;
  if (!allowedOrigin || allowedOrigin.trim() === '') {
    console.warn('[SECURITY] CORS_ALLOWED_ORIGIN is not configured. Cross-origin browser requests will be rejected.');
  } else if (allowedOrigin === '*') {
    console.warn('[SECURITY] CORS_ALLOWED_ORIGIN is set to wildcard (*). Explicit origin is strongly recommended.');
  }

  if (issues.length > 0) {
    console.warn('[CONFIG_VALIDATION] Warnings detected:');
    issues.forEach((iss) => console.warn(`  - ${iss}`));
  } else {
    console.log('[CONFIG_VALIDATION] Environment variables validated successfully.');
  }
}

validateEnvironment();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Multer memory storage configured with 25 MB file limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
});

// Explicit CORS origin enforcement (no wildcard default)
const allowedOriginEnv = process.env.CORS_ALLOWED_ORIGIN;
const allowedOrigins = allowedOriginEnv
  ? allowedOriginEnv.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients (curl, mobile, tests) have no origin header
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.length === 0) {
      return callback(
        new Error('Cross-Origin Request Blocked: CORS_ALLOWED_ORIGIN is not configured.')
      );
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new Error(`Cross-Origin Request Blocked: Origin ${origin} not allowed by CORS policy.`)
    );
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-guest-token',
    'x-api-key',
    'x-session-token',
    'cloudconvert-signature',
  ],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.text({ type: 'application/json' })); // Support raw body for webhook verification

// Helper: Extract authenticated user from session cookie, Bearer token, or API key
async function resolveUser(req: Request): Promise<any | null> {
  const configuredApiKey = process.env.TOOLS_API_KEY;
  const apiKeyHeader = req.headers['x-api-key'];
  if (configuredApiKey && apiKeyHeader === configuredApiKey) {
    return {
      id: 'test-admin-user',
      email: 'test-admin@pathway.eco',
      name: 'Test Administrator',
      role: 'ADMIN',
      isOnboarded: true,
    };
  }

  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']).trim();
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(
      new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`)
    );
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  try {
    return await UserService.getSession(token);
  } catch (err) {
    console.error('[AUTH_RESOLVE_ERROR]', err);
    return null;
  }
}

// Helper: Format ToolError responses to match Next.js API contract
function handleToolError(res: Response, error: any, defaultCode = 'INTERNAL_ERROR', defaultStatus = 500) {
  const isToolErr =
    error instanceof ToolError ||
    error?.name === 'ToolError' ||
    (typeof error?.code === 'string' && typeof error?.statusCode === 'number');

  if (isToolErr) {
    return res.status(error.statusCode || defaultStatus).json({
      success: false,
      error: {
        code: error.code || defaultCode,
        message: error.userMessage || error.message || 'Operation failed',
      },
    });
  }

  return res.status(defaultStatus).json({
    success: false,
    error: {
      code: defaultCode,
      message: error?.message || 'An unexpected error occurred.',
    },
  });
}

// -------------------------------------------------------------
// 1. Health Endpoint
// -------------------------------------------------------------
app.get('/api/tools/health', async (_req: Request, res: Response) => {
  try {
    const provider = ConversionProviderFactory.getProvider();
    const available = await provider.healthCheck();

    return res.json({
      success: true,
      available,
      provider: provider.name,
      concurrency: {
        running: gotenbergSemaphore.runningCount,
        queued: gotenbergSemaphore.queuedCount,
      },
    });
  } catch {
    return res.json({
      success: true,
      available: false,
      provider: 'unknown',
    });
  }
});

// -------------------------------------------------------------
// 2. Start Document Conversion (POST /api/tools/conversions)
// -------------------------------------------------------------
app.post('/api/tools/conversions', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

    const file = req.file;
    const targetFormat = (req.body.targetFormat as string) || 'pdf';

    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_FILE',
          message: 'No file was uploaded.',
        },
      });
    }

    // Enforce single-concurrency for Gotenberg conversions
    await gotenbergSemaphore.acquire();
    try {
      const result = await ConversionService.startConversion({
        filename: file.originalname,
        buffer: file.buffer,
        clientMimeType: file.mimetype,
        targetFormat,
        userId: user?.id || null,
        clientIp,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } finally {
      gotenbergSemaphore.release();
    }
  } catch (error: any) {
    console.error('[API_CONVERSIONS_POST_ERROR]', error);
    return handleToolError(res, error, 'CONVERSION_FAILED', 400);
  }
});

// -------------------------------------------------------------
// 3. Get Conversion Status (GET /api/tools/conversions/:id)
// -------------------------------------------------------------
app.get('/api/tools/conversions/:id', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const guestToken = (req.query.guestToken as string) || (req.headers['x-guest-token'] as string) || null;

    const statusData = await ConversionService.getJobStatus(
      req.params.id,
      user?.id || null,
      guestToken
    );

    return res.json({
      success: true,
      data: statusData,
    });
  } catch (error: any) {
    return handleToolError(res, error, 'JOB_NOT_FOUND', 404);
  }
});

// -------------------------------------------------------------
// 4. Cancel Conversion Job (DELETE /api/tools/conversions/:id)
// -------------------------------------------------------------
app.delete('/api/tools/conversions/:id', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const guestToken = (req.query.guestToken as string) || (req.headers['x-guest-token'] as string) || null;

    await ConversionService.cancelJob(req.params.id, user?.id || null, guestToken);

    return res.json({
      success: true,
      message: 'Conversion job deleted.',
    });
  } catch (error: any) {
    return handleToolError(res, error, 'UNAUTHORIZED_ACCESS', 403);
  }
});

// -------------------------------------------------------------
// 5. Download Converted Document (GET /api/tools/conversions/:id/download)
// -------------------------------------------------------------
app.get('/api/tools/conversions/:id/download', async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    const guestToken =
      (req.query.guestToken as string) ||
      (req.query.token as string) ||
      (req.headers['x-guest-token'] as string) ||
      null;

    const downloadData = await ConversionService.getDownloadStream(
      req.params.id,
      user?.id || null,
      guestToken
    );

    const safeFilename = downloadData.filename.replace(/"/g, '');

    res.setHeader('Content-Type', downloadData.mimeType);
    res.setHeader('Content-Length', downloadData.sizeBytes.toString());
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return res.status(200).send(downloadData.buffer);
  } catch (error: any) {
    console.error('[API_DOWNLOAD_GET_ERROR]', error);
    return handleToolError(res, error, 'UNAUTHORIZED_ACCESS', 403);
  }
});

// -------------------------------------------------------------
// 6. PDF Merge (POST /api/tools/pdf/merge)
// -------------------------------------------------------------
app.post('/api/tools/pdf/merge', upload.array('files'), async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to merge PDF files.',
        },
      });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'At least 2 PDF files are required for merging.',
        },
      });
    }

    const pdfItems = files.map((f) => ({
      filename: f.originalname,
      buffer: f.buffer,
    }));

    const result = await PdfToolsService.mergePdfs({ files: pdfItems });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', result.sizeBytes.toString());
    res.setHeader('Content-Disposition', 'attachment; filename="merged-document.pdf"');

    return res.status(200).send(Buffer.from(result.mergedBuffer));
  } catch (error: any) {
    return handleToolError(res, error, 'MERGE_FAILED', 400);
  }
});

// -------------------------------------------------------------
// 7. PDF Split (POST /api/tools/pdf/split)
// -------------------------------------------------------------
app.post('/api/tools/pdf/split', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to split PDF files.',
        },
      });
    }

    const file = req.file;
    const pageRanges = (req.body.pageRanges as string) || '';

    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_FILE',
          message: 'Please select a PDF file to split.',
        },
      });
    }

    const result = await PdfToolsService.splitPdf({
      buffer: file.buffer,
      filename: file.originalname,
      pageRanges,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', result.sizeBytes.toString());
    res.setHeader('Content-Disposition', 'attachment; filename="split-document.pdf"');

    return res.status(200).send(Buffer.from(result.splitBuffer));
  } catch (error: any) {
    return handleToolError(res, error, 'SPLIT_FAILED', 400);
  }
});

// -------------------------------------------------------------
// 8. PDF Rotate (POST /api/tools/pdf/rotate)
// -------------------------------------------------------------
app.post('/api/tools/pdf/rotate', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to rotate PDF files.',
        },
      });
    }

    const file = req.file;
    const rotationStr = (req.body.rotationDegrees as string) || '90';
    const pagesStr = (req.body.pages as string) || 'all';

    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_FILE',
          message: 'Please select a PDF file to rotate.',
        },
      });
    }

    const degreesVal = parseInt(rotationStr, 10);
    if (![90, 180, 270].includes(degreesVal)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Rotation degree must be 90, 180, or 270.',
        },
      });
    }

    let targetPages: 'all' | number[] = 'all';
    if (pagesStr !== 'all' && pagesStr.trim()) {
      try {
        const parsed = JSON.parse(pagesStr);
        if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
          targetPages = parsed;
        }
      } catch {
        targetPages = 'all';
      }
    }

    const result = await PdfToolsService.rotatePdf({
      buffer: file.buffer,
      filename: file.originalname,
      rotationDegrees: degreesVal as 90 | 180 | 270,
      targetPages,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', result.sizeBytes.toString());
    res.setHeader('Content-Disposition', 'attachment; filename="rotated-document.pdf"');

    return res.status(200).send(Buffer.from(result.rotatedBuffer));
  } catch (error: any) {
    return handleToolError(res, error, 'ROTATE_FAILED', 400);
  }
});

// -------------------------------------------------------------
// 9. PDF Compress (POST /api/tools/pdf/compress)
// -------------------------------------------------------------
app.post('/api/tools/pdf/compress', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to compress PDF files.',
        },
      });
    }

    const file = req.file;
    const level = (req.body.level as 'basic' | 'balanced' | 'strong') || 'balanced';

    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_FILE',
          message: 'Please select a PDF file to compress.',
        },
      });
    }

    const result = await PdfToolsService.compressPdf({
      buffer: file.buffer,
      filename: file.originalname,
      level,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', result.compressedSizeBytes.toString());
    res.setHeader('Content-Disposition', 'attachment; filename="compressed-document.pdf"');

    return res.status(200).send(Buffer.from(result.compressedBuffer));
  } catch (error: any) {
    return handleToolError(res, error, 'COMPRESS_FAILED', 400);
  }
});

// -------------------------------------------------------------
// 10. Purge / Cleanup Cycle (POST /api/tools/cleanup)
// -------------------------------------------------------------
app.post('/api/tools/cleanup', async (req: Request, res: Response) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.trim().length === 0) {
      console.error('[ToolCleanupAPI] CRON_SECRET is not configured');
      return res.status(500).json({
        success: false,
        error: 'Cleanup service configuration error',
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized cleanup request',
      });
    }

    const result = await CleanupService.runCleanupCycle();
    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[ToolCleanupAPI] Cleanup cycle error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cleanup cycle failed',
    });
  }
});

// -------------------------------------------------------------
// 11. CloudConvert Webhook (POST /api/tools/webhooks/cloudconvert)
// -------------------------------------------------------------
app.post('/api/tools/webhooks/cloudconvert', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['cloudconvert-signature'] as string;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const result = await ConversionService.handleWebhookEvent(rawBody, signature);

    return res.json({
      success: true,
      handled: result.handled,
      jobId: result.jobId,
      status: result.status,
    });
  } catch (error: any) {
    console.error('[CLOUDCONVERT_WEBHOOK_ERROR]', error);

    if (error instanceof ToolError && error.code === 'UNAUTHORIZED_ACCESS') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized webhook signature',
      });
    }

    return res.status(400).json({
      success: false,
      error: error?.message || 'Webhook processing failed',
    });
  }
});

// Multer error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `The uploaded file exceeds the ${MAX_UPLOAD_SIZE_MB}MB size limit.`,
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'REQUEST_ERROR',
        message: err.message,
      },
    });
  }
});

// Server listener & graceful shutdown
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[PATHWAY_TOOLS_SERVER] Running on http://0.0.0.0:${port}`);
  console.log(`[PATHWAY_TOOLS_SERVER] Gotenberg Semaphore Max Concurrency: 1`);
  console.log(`[PATHWAY_TOOLS_SERVER] Max Upload Limit: ${MAX_UPLOAD_SIZE_MB}MB`);
});

async function handleShutdown(signal: string) {
  console.log(`[PATHWAY_TOOLS_SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[PATHWAY_TOOLS_SERVER] HTTP server closed.');
    try {
      await db.$disconnect();
      console.log('[PATHWAY_TOOLS_SERVER] Database disconnected.');
    } catch {}
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[PATHWAY_TOOLS_SERVER] Force-closing after 15s timeout.');
    process.exit(1);
  }, 15000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
