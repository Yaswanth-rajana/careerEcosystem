import { GOTENBERG_URL, CONVERSION_TIMEOUT_MS, SUPPORTED_CONVERSIONS } from './constants';
import { ConversionProvider, ConversionOptions, ConversionResult } from './conversion-provider';
import { ToolError } from './errors';

export class GotenbergConversionProvider implements ConversionProvider {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || GOTENBERG_URL).replace(/\/$/, '');
  }

  public supports(sourceFormat: string, targetFormat: string): boolean {
    const src = sourceFormat.toLowerCase();
    const tgt = targetFormat.toLowerCase();
    const allowed = SUPPORTED_CONVERSIONS[src];
    return !!allowed && allowed.includes(tgt);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  public async convertToPdf(inputBuffer: Buffer, options: ConversionOptions): Promise<ConversionResult> {
    if (!this.supports(options.sourceFormat, options.targetFormat)) {
      throw new ToolError('UNSUPPORTED_CONVERSION');
    }

    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || CONVERSION_TIMEOUT_MS;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const filename = options.originalFilename || `input.${options.sourceFormat}`;
    const magicBytesHex = inputBuffer.slice(0, 16).toString('hex').toUpperCase();

    // Log structured INPUT diagnostic
    console.log('[CONVERSION_INPUT_DIAGNOSTIC]', JSON.stringify({
      filename,
      extension: options.sourceFormat,
      mimeType: options.mimeType || 'application/octet-stream',
      size: inputBuffer.length,
      magicBytesHex,
    }));

    try {
      const formData = new FormData();
      const blob = new Blob([inputBuffer as unknown as BlobPart], { type: options.mimeType || 'application/octet-stream' });
      formData.append('files', blob, filename);

      const endpoint = `${this.baseUrl}/forms/libreoffice/convert`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Log structured GOTENBERG diagnostic
      console.log('[CONVERSION_GOTENBERG_DIAGNOSTIC]', JSON.stringify({
        url: endpoint,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      }));

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        if (response.status === 400 || errorText.includes('LibreOffice')) {
          throw new ToolError('CORRUPTED_FILE', `Gotenberg conversion failed: ${errorText.substring(0, 200)}`);
        }
        if (response.status === 408 || response.status === 504) {
          throw new ToolError('CONVERSION_TIMEOUT');
        }

        throw new ToolError('CONVERSION_FAILED', `Gotenberg error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      const outputMagicHex = pdfBuffer.slice(0, 5).toString('hex').toUpperCase();

      if (pdfBuffer.slice(0, 5).toString('ascii') !== '%PDF-') {
        throw new ToolError('OUTPUT_VALIDATION_FAILED', `Gotenberg output header invalid (expected %PDF-, got hex ${outputMagicHex})`);
      }

      const processingTimeMs = Date.now() - startTime;

      console.log('[CONVERSION_GOTENBERG_OUTPUT]', JSON.stringify({
        size: pdfBuffer.length,
        magicBytesHex: pdfBuffer.slice(0, 16).toString('hex').toUpperCase(),
        detectedMime: response.headers.get('content-type') || 'application/pdf',
        processingTimeMs,
      }));

      return {
        pdfBuffer,
        processingTimeMs,
      };
    } catch (err: any) {
      clearTimeout(timeout);

      if (err instanceof ToolError) {
        throw err;
      }

      if (
        err.code === 'ECONNREFUSED' ||
        err.name === 'AbortError' ||
        err.message?.includes('fetch failed') ||
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('unreachable')
      ) {
        throw new ToolError('TOOL_UNAVAILABLE', 'Document conversion service is currently unreachable.');
      }

      throw new ToolError('CONVERSION_FAILED', err.message);
    }
  }
}

