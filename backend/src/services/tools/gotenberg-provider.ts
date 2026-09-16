import zlib from 'zlib';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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
      if (response.ok) return true;
    } catch {
      // Dev fallback PDF generator handles local testing if Gotenberg container is off
    }

    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Helper to extract clean text paragraphs from DOCX (deflated XML) or TXT files.
   */
  public static extractCleanText(inputBuffer: Buffer, extension: string): string[] {
    const ext = extension.toLowerCase();

    if (ext === 'txt') {
      const rawText = inputBuffer.toString('utf-8');
      return rawText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    }

    const paragraphs: string[] = [];

    // Check if file is a ZIP package (DOCX, XLSX, PPTX, ODT)
    if (
      inputBuffer.length > 30 &&
      inputBuffer[0] === 0x50 &&
      inputBuffer[1] === 0x4b &&
      inputBuffer[2] === 0x03 &&
      inputBuffer[3] === 0x04
    ) {
      try {
        let offset = 0;
        while (offset < inputBuffer.length - 30) {
          if (
            inputBuffer[offset] === 0x50 &&
            inputBuffer[offset + 1] === 0x4b &&
            inputBuffer[offset + 2] === 0x03 &&
            inputBuffer[offset + 3] === 0x04
          ) {
            const compMethod = inputBuffer.readUInt16LE(offset + 8);
            const compSize = inputBuffer.readUInt32LE(offset + 18);
            const fileNameLen = inputBuffer.readUInt16LE(offset + 26);
            const extraLen = inputBuffer.readUInt16LE(offset + 28);

            const fileName = inputBuffer
              .slice(offset + 30, offset + 30 + fileNameLen)
              .toString('utf-8');

            const dataStart = offset + 30 + fileNameLen + extraLen;
            const dataEnd = dataStart + compSize;

            if (fileName === 'word/document.xml' && dataEnd <= inputBuffer.length) {
              const compData = inputBuffer.slice(dataStart, dataEnd);
              let xmlStr = '';
              if (compMethod === 8) {
                xmlStr = zlib.inflateRawSync(compData).toString('utf-8');
              } else if (compMethod === 0) {
                xmlStr = compData.toString('utf-8');
              }

              const textMatches = xmlStr.match(/<w:t[^>]*>(.*?)<\/w:t>/gi) || [];
              for (const match of textMatches) {
                const clean = match
                  .replace(/<[^>]+>/g, '')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&apos;/g, "'")
                  .trim();

                if (
                  clean &&
                  clean.length > 0 &&
                  !clean.includes('xml') &&
                  !clean.includes('http://') &&
                  !clean.includes('Schemas') &&
                  !clean.includes('word/document.xml') &&
                  !clean.includes('[Content_Types].xml')
                ) {
                  paragraphs.push(clean);
                }
              }
              break;
            }
            offset += 30 + fileNameLen + extraLen + compSize;
          } else {
            offset++;
          }
        }
      } catch {
        // Safe fallback if ZIP decompression fails
      }
    }

    if (paragraphs.length > 0) {
      return paragraphs;
    }

    // Fallback for plain text or legacy binary: extract clean printable words
    const rawStr = inputBuffer.toString('binary');
    const words = rawStr
      .replace(/<[^>]+>/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .split(/\s+/)
      .filter(
        (w) =>
          w.length >= 2 &&
          !/^(PK|xml|word\/|\[Content_Types\]|theme|styles|docProps|rel|_rels)/i.test(w)
      );

    const lineBuffer: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length > 70) {
        if (currentLine) lineBuffer.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    }
    if (currentLine) lineBuffer.push(currentLine.trim());

    return lineBuffer.slice(0, 40);
  }

  private async generateFallbackPdf(inputBuffer: Buffer, options: ConversionOptions): Promise<ConversionResult> {
    const startTime = Date.now();
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const margin = 50;

    // Top Brand Header Banner
    page.drawRectangle({
      x: 0,
      y: height - 85,
      width,
      height: 85,
      color: rgb(0.388, 0.4, 0.945), // #6366F1
    });

    page.drawText('PATHWAY.ECO DOCUMENT CONVERTER', {
      x: margin,
      y: height - 35,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    const safeTitle = (options.originalFilename || 'Document.pdf').replace(/[^\x20-\x7E]/g, '');
    page.drawText(safeTitle.substring(0, 45), {
      x: margin,
      y: height - 65,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    let y = height - 120;

    // Extract clean readable text paragraphs from uncompressed DOCX XML or TXT
    const paragraphs = GotenbergConversionProvider.extractCleanText(inputBuffer, options.sourceFormat);

    if (paragraphs.length > 0) {
      for (const p of paragraphs) {
        if (y < 60) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = height - 60;
        }

        const isHeading = p.length < 40 && p.toUpperCase() === p;
        const fontToUse = isHeading ? boldFont : font;
        const fontSize = isHeading ? 11 : 10;
        const colorToUse = isHeading ? rgb(0.1, 0.1, 0.1) : rgb(0.2, 0.2, 0.2);

        const words = p.split(' ');
        let line = '';
        for (const w of words) {
          if ((line + ' ' + w).length > 75) {
            page.drawText(line, { x: margin, y, size: fontSize, font: fontToUse, color: colorToUse });
            y -= 14;
            if (y < 60) {
              page = pdfDoc.addPage([595.28, 841.89]);
              y = height - 60;
            }
            line = w;
          } else {
            line += (line ? ' ' : '') + w;
          }
        }
        if (line) {
          page.drawText(line, { x: margin, y, size: fontSize, font: fontToUse, color: colorToUse });
          y -= 18;
        }
      }
    } else {
      page.drawText('Document content parsed and converted to PDF page format.', {
        x: margin,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return {
      pdfBuffer: Buffer.from(pdfBytes),
      processingTimeMs: Date.now() - startTime,
    };
  }

  public async convertToPdf(inputBuffer: Buffer, options: ConversionOptions): Promise<ConversionResult> {
    if (!this.supports(options.sourceFormat, options.targetFormat)) {
      throw new ToolError('UNSUPPORTED_CONVERSION');
    }

    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || CONVERSION_TIMEOUT_MS;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const formData = new FormData();
      const fileName = options.originalFilename || `input.${options.sourceFormat}`;
      const blob = new Blob([new Uint8Array(inputBuffer)], { type: 'application/octet-stream' });
      formData.append('files', blob, fileName);

      const endpoint = `${this.baseUrl}/forms/libreoffice/convert`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        if (response.status === 400 || errorText.includes('LibreOffice')) {
          throw new ToolError('CORRUPTED_FILE', `Gotenberg conversion failed: ${errorText}`);
        }
        if (response.status === 408 || response.status === 504) {
          throw new ToolError('CONVERSION_TIMEOUT');
        }

        throw new ToolError('CONVERSION_FAILED', `Gotenberg error ${response.status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      const processingTimeMs = Date.now() - startTime;

      return {
        pdfBuffer,
        processingTimeMs,
      };
    } catch (err: any) {
      clearTimeout(timeout);

      if (err instanceof ToolError && err.code !== 'TOOL_UNAVAILABLE') {
        throw err;
      }

      // Connection refused / Gotenberg unreachable fallback for local dev
      if (
        err.code === 'ECONNREFUSED' ||
        err.message?.includes('fetch failed') ||
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('unreachable')
      ) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[GotenbergFallback] Gotenberg container unreachable on port 3001. Using dev PDF generator fallback.');
          return this.generateFallbackPdf(inputBuffer, options);
        }
        throw new ToolError('TOOL_UNAVAILABLE', 'Document conversion service is currently unreachable.');
      }

      throw new ToolError('CONVERSION_FAILED', err.message);
    }
  }
}
