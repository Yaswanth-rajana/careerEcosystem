import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { SUPPORTED_CONVERSIONS } from './constants';
import {
  ConversionProvider,
  ConversionOptions,
  ConversionResult,
  AsyncJobCreationResult,
  ProviderJobStatusResult,
} from './conversion-provider';
import { ToolError } from './errors';

interface MockJobEntry {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  outputBuffer?: Buffer;
  createdAt: number;
  options: ConversionOptions;
}

const getMockJobsMap = (): Map<string, MockJobEntry> => {
  if (!(globalThis as any).__mockConversionJobs) {
    (globalThis as any).__mockConversionJobs = new Map<string, MockJobEntry>();
  }
  return (globalThis as any).__mockConversionJobs;
};

export class MockConversionProvider implements ConversionProvider {
  public readonly name = 'mock';
  public shouldFail = false;
  public shouldTimeout = false;
  public failureCode: any = 'CONVERSION_FAILED';
  public failureMessage = 'Simulated mock conversion failure';
  public isHealthy = true;

  private get jobs(): Map<string, MockJobEntry> {
    return getMockJobsMap();
  }

  public supports(sourceFormat: string, targetFormat: string): boolean {
    const src = sourceFormat.toLowerCase();
    const tgt = targetFormat.toLowerCase();
    const allowed = SUPPORTED_CONVERSIONS[src];
    return !!allowed && allowed.includes(tgt);
  }

  public async healthCheck(): Promise<boolean> {
    return this.isHealthy;
  }

  /**
   * Generates a real, spec-compliant PDF document with text and page.
   * If an inputBuffer is provided (e.g. DOCX), extracts and renders the real document paragraphs.
   */
  public async generateMockPdf(options: ConversionOptions, inputBuffer?: Buffer): Promise<Buffer> {
    if (inputBuffer && options.sourceFormat.toLowerCase() === 'docx') {
      try {
        const mammoth = await import('mammoth');
        const extracted = await mammoth.extractRawText({ buffer: inputBuffer });
        const rawText = (extracted.value || '').trim();

        if (rawText.length > 0) {
          const pdfDoc = await PDFDocument.create();
          const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

          let page = pdfDoc.addPage([595.28, 841.89]); // Standard A4
          const { width, height } = page.getSize();
          const margin = 50;
          const contentWidth = width - margin * 2;
          let y = height - 55;

          const sanitizeText = (txt: string) =>
            txt
              .replace(/[\u2018\u2019]/g, "'")
              .replace(/[\u201C\u201D]/g, '"')
              .replace(/[\u2013\u2014]/g, '-')
              .replace(/\u2022/g, '*')
              .replace(/\u2026/g, '...')
              .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');

          // Document Header Banner
          const title = sanitizeText(options.originalFilename || 'Converted Document');
          page.drawText(title, {
            x: margin,
            y,
            size: 16,
            font: fontBold,
            color: rgb(0.12, 0.16, 0.28),
          });
          y -= 10;

          page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 1,
            color: rgb(0.85, 0.88, 0.92),
          });
          y -= 25;

          const paragraphs = rawText.split(/\r?\n/).map((p: string) => p.trim()).filter(Boolean);

          for (const rawPara of paragraphs) {
            const para = sanitizeText(rawPara);
            const isHeading = para.length < 60 && (para.endsWith(':') || !para.endsWith('.'));
            const font = isHeading ? fontBold : fontRegular;
            const fontSize = isHeading ? 12 : 10;
            const lineHeight = isHeading ? 18 : 14;

            const words = para.split(/\s+/);
            let currentLine = '';

            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const testWidth = font.widthOfTextAtSize(testLine, fontSize);
              if (testWidth > contentWidth && currentLine) {
                if (y < 60) {
                  page = pdfDoc.addPage([595.28, 841.89]);
                  y = height - 60;
                }
                page.drawText(currentLine, {
                  x: margin,
                  y,
                  size: fontSize,
                  font,
                  color: isHeading ? rgb(0.12, 0.16, 0.28) : rgb(0.2, 0.22, 0.25),
                });
                y -= lineHeight;
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine) {
              if (y < 60) {
                page = pdfDoc.addPage([595.28, 841.89]);
                y = height - 60;
              }
              page.drawText(currentLine, {
                x: margin,
                y,
                size: fontSize,
                font,
                color: isHeading ? rgb(0.12, 0.16, 0.28) : rgb(0.2, 0.22, 0.25),
              });
              y -= lineHeight;
            }

            y -= 6; // Spacing after paragraph
          }

          const pdfBytes = await pdfDoc.save();
          return Buffer.from(pdfBytes);
        }
      } catch (err) {
        console.warn('[MOCK_CONVERSION_DOCX_EXTRACTION_WARN]', err);
      }
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([600, 800]);

    page.drawText(`PATHWAY.ECO Converted Document`, {
      x: 50,
      y: 730,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.3),
    });

    page.drawText(`Original Filename: ${options.originalFilename}`, {
      x: 50,
      y: 690,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Format: ${options.sourceFormat.toUpperCase()} -> PDF`, {
      x: 50,
      y: 665,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Job ID: ${options.jobId}`, {
      x: 50,
      y: 640,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(`Converted successfully via PATHWAY.ECO Serverless Engine.`, {
      x: 50,
      y: 600,
      size: 12,
      font,
      color: rgb(0.1, 0.6, 0.3),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  public async convertToPdf(
    inputBuffer: Buffer,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    if (!this.supports(options.sourceFormat, options.targetFormat)) {
      throw new ToolError('UNSUPPORTED_CONVERSION');
    }

    if (this.shouldTimeout) {
      throw new ToolError('CONVERSION_TIMEOUT');
    }

    if (this.shouldFail) {
      throw new ToolError(this.failureCode, this.failureMessage);
    }

    const startTime = Date.now();
    const pdfBuffer = await this.generateMockPdf(options, inputBuffer);

    return {
      pdfBuffer,
      processingTimeMs: Math.max(1, Date.now() - startTime),
    };
  }

  public async createAsyncJob(
    options: ConversionOptions,
    inputBuffer?: Buffer
  ): Promise<AsyncJobCreationResult> {
    if (!this.supports(options.sourceFormat, options.targetFormat)) {
      throw new ToolError('UNSUPPORTED_CONVERSION');
    }

    if (this.shouldFail) {
      throw new ToolError(this.failureCode, this.failureMessage);
    }

    const providerJobId = `mock-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const outputBuffer = await this.generateMockPdf(options, inputBuffer);

    this.jobs.set(providerJobId, {
      status: 'PROCESSING',
      outputBuffer,
      createdAt: Date.now(),
      options,
    });

    return {
      providerJobId,
      status: 'PROCESSING',
      uploadUrl: `https://storage.cloudconvert.com/mock-upload/${providerJobId}`,
    };
  }

  public async getJobStatus(providerJobId: string): Promise<ProviderJobStatusResult> {
    const job = this.jobs.get(providerJobId);
    if (!job && !providerJobId.startsWith('mock-')) {
      throw new ToolError('JOB_NOT_FOUND', 'Mock provider job not found');
    }

    if (this.shouldFail) {
      return {
        providerJobId,
        status: 'FAILED',
        errorCode: this.failureCode,
        errorMessage: this.failureMessage,
      };
    }

    return {
      providerJobId,
      status: 'COMPLETED',
      outputUrl: `https://storage.cloudconvert.com/mock-export/${providerJobId}/output.pdf`,
      processingTimeMs: 150,
    };
  }

  public async fetchConvertedPdf(outputUrl: string): Promise<Buffer> {
    // Extract providerJobId or generate standard mock
    const match = outputUrl.match(/mock-export\/([^/]+)/);
    const jobId = match ? match[1] : '';
    const job = this.jobs.get(jobId);

    if (job?.outputBuffer) {
      return job.outputBuffer;
    }

    return await this.generateMockPdf({
      jobId: 'direct',
      originalFilename: 'document.pdf',
      sourceFormat: 'docx',
      targetFormat: 'pdf',
    });
  }

  public async cancelJob(providerJobId: string): Promise<void> {
    this.jobs.delete(providerJobId);
  }
}
