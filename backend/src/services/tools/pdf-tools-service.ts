import { PDFDocument, degrees } from 'pdf-lib';
import { ToolError } from './errors';
import { OutputValidationService } from './output-validation-service';

export interface PdfMergeOptions {
  files: Array<{ filename: string; buffer: Buffer }>;
}

export interface PdfSplitOptions {
  buffer: Buffer;
  filename: string;
  pageRanges?: string; // e.g. "1-3, 5, 8-10"
}

export interface PdfRotateOptions {
  buffer: Buffer;
  filename: string;
  rotationDegrees: 90 | 180 | 270;
  targetPages?: 'all' | number[]; // 1-indexed page numbers
}

export interface PdfCompressOptions {
  buffer: Buffer;
  filename: string;
  level?: 'basic' | 'balanced' | 'strong';
}

export class PdfToolsService {
  /**
   * Helper: Parse page ranges string like "1-3, 5, 8-10" into 0-indexed page indices.
   */
  public static parsePageRanges(rangesStr: string, totalPages: number): number[] {
    if (!rangesStr || !rangesStr.trim()) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const indicesSet = new Set<number>();
    const parts = rangesStr.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);

        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
          throw new ToolError('INVALID_FILE_TYPE', `Invalid page range format: "${part}"`);
        }

        const clampedStart = Math.max(1, start);
        const clampedEnd = Math.min(totalPages, end);

        for (let p = clampedStart; p <= clampedEnd; p++) {
          indicesSet.add(p - 1);
        }
      } else {
        const pNum = parseInt(trimmed, 10);
        if (isNaN(pNum) || pNum < 1 || pNum > totalPages) {
          throw new ToolError('INVALID_FILE_TYPE', `Page number out of bounds: "${trimmed}"`);
        }
        indicesSet.add(pNum - 1);
      }
    }

    const sorted = Array.from(indicesSet).sort((a, b) => a - b);
    if (sorted.length === 0) {
      throw new ToolError('INVALID_FILE_TYPE', 'No valid pages selected in specified range');
    }

    return sorted;
  }

  /**
   * Merges multiple PDF files into one.
   */
  public static async mergePdfs(options: PdfMergeOptions): Promise<{ mergedBuffer: Buffer; pageCount: number; sizeBytes: number }> {
    if (!options.files || options.files.length < 2) {
      throw new ToolError('INVALID_FILE_TYPE', 'At least 2 PDF files are required for merging');
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of options.files) {
        await OutputValidationService.validatePdfOutput(item.buffer, 'merge-item', 'pdf');
        const pdf = await PDFDocument.load(item.buffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const mergedBuffer = Buffer.from(mergedBytes);
      await OutputValidationService.validatePdfOutput(mergedBuffer, 'merge-result', 'pdf');

      return {
        mergedBuffer,
        pageCount: mergedPdf.getPageCount(),
        sizeBytes: mergedBuffer.length,
      };
    } catch (err: any) {
      if (err instanceof ToolError) throw err;
      if (err.message?.includes('encrypted') || err.message?.includes('password')) {
        throw new ToolError('PASSWORD_PROTECTED_FILE');
      }
      throw new ToolError('CONVERSION_FAILED', `Failed to merge PDFs: ${err.message}`);
    }
  }

  /**
   * Splits a PDF file based on page ranges.
   */
  public static async splitPdf(options: PdfSplitOptions): Promise<{ splitBuffer: Buffer; pageCount: number; sizeBytes: number }> {
    await OutputValidationService.validatePdfOutput(options.buffer, 'split-item', 'pdf');

    try {
      const srcPdf = await PDFDocument.load(options.buffer, { ignoreEncryption: true });
      const totalPages = srcPdf.getPageCount();

      const pageIndices = this.parsePageRanges(options.pageRanges || '', totalPages);

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
      copiedPages.forEach((p) => newPdf.addPage(p));

      const splitBytes = await newPdf.save();
      const splitBuffer = Buffer.from(splitBytes);
      await OutputValidationService.validatePdfOutput(splitBuffer, 'split-result', 'pdf');

      return {
        splitBuffer,
        pageCount: newPdf.getPageCount(),
        sizeBytes: splitBuffer.length,
      };
    } catch (err: any) {
      if (err instanceof ToolError) throw err;
      if (err.message?.includes('encrypted') || err.message?.includes('password')) {
        throw new ToolError('PASSWORD_PROTECTED_FILE');
      }
      throw new ToolError('CONVERSION_FAILED', `Failed to split PDF: ${err.message}`);
    }
  }

  /**
   * Rotates PDF pages.
   */
  public static async rotatePdf(options: PdfRotateOptions): Promise<{ rotatedBuffer: Buffer; pageCount: number; sizeBytes: number }> {
    await OutputValidationService.validatePdfOutput(options.buffer, 'rotate-item', 'pdf');

    if (![90, 180, 270].includes(options.rotationDegrees)) {
      throw new ToolError('INVALID_FILE_TYPE', 'Rotation angle must be 90, 180, or 270 degrees');
    }

    try {
      const pdfDoc = await PDFDocument.load(options.buffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();
      const pages = pdfDoc.getPages();

      let targetIndices: number[] = [];
      if (!options.targetPages || options.targetPages === 'all') {
        targetIndices = Array.from({ length: totalPages }, (_, i) => i);
      } else {
        targetIndices = options.targetPages.map((p) => p - 1).filter((p) => p >= 0 && p < totalPages);
      }

      for (const idx of targetIndices) {
        const page = pages[idx];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + options.rotationDegrees) % 360));
      }

      const rotatedBytes = await pdfDoc.save();
      const rotatedBuffer = Buffer.from(rotatedBytes);
      await OutputValidationService.validatePdfOutput(rotatedBuffer, 'rotate-result', 'pdf');

      return {
        rotatedBuffer,
        pageCount: totalPages,
        sizeBytes: rotatedBuffer.length,
      };
    } catch (err: any) {
      if (err instanceof ToolError) throw err;
      if (err.message?.includes('encrypted') || err.message?.includes('password')) {
        throw new ToolError('PASSWORD_PROTECTED_FILE');
      }
      throw new ToolError('CONVERSION_FAILED', `Failed to rotate PDF: ${err.message}`);
    }
  }

  /**
   * Compresses & optimizes PDF streams, stripping redundant objects.
   */
  public static async compressPdf(options: PdfCompressOptions): Promise<{
    compressedBuffer: Buffer;
    originalSizeBytes: number;
    compressedSizeBytes: number;
    savedPercentage: number;
  }> {
    await OutputValidationService.validatePdfOutput(options.buffer, 'compress-item', 'pdf');
    const originalSizeBytes = options.buffer.length;

    try {
      const pdfDoc = await PDFDocument.load(options.buffer, { ignoreEncryption: true });

      // Save PDF with object streams enabled and unreferenced objects removed
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressedBuffer = Buffer.from(compressedBytes);
      await OutputValidationService.validatePdfOutput(compressedBuffer, 'compress-result', 'pdf');

      const compressedSizeBytes = compressedBuffer.length;
      let savedPercentage = 0;

      if (compressedSizeBytes < originalSizeBytes) {
        savedPercentage = parseFloat((((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100).toFixed(1));
      } else {
        // If optimized output is slightly larger or already compressed, keep original buffer to prevent inflation
        savedPercentage = 0;
      }

      return {
        compressedBuffer: savedPercentage > 0 ? compressedBuffer : options.buffer,
        originalSizeBytes,
        compressedSizeBytes: savedPercentage > 0 ? compressedSizeBytes : originalSizeBytes,
        savedPercentage,
      };
    } catch (err: any) {
      if (err instanceof ToolError) throw err;
      if (err.message?.includes('encrypted') || err.message?.includes('password')) {
        throw new ToolError('PASSWORD_PROTECTED_FILE');
      }
      throw new ToolError('CONVERSION_FAILED', `Failed to compress PDF: ${err.message}`);
    }
  }
}
