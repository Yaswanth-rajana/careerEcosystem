import {
  MAX_UPLOAD_SIZE_BYTES,
  SUPPORTED_CONVERSIONS,
  SUPPORTED_INPUT_EXTENSIONS,
} from './constants';
import { ToolError } from './errors';

export interface ValidatedFileInfo {
  originalFilename: string;
  sanitizedFilename: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
}

export class FileValidationService {
  /**
   * Sanitizes a filename to prevent path traversal, null-byte injection, or dangerous characters.
   */
  public static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return 'document';
    }

    // Remove path components
    let cleanName = filename.replace(/^.*[\\/]/, '');
    
    // Remove null bytes and control characters
    cleanName = cleanName.replace(/[\x00-\x1F\x7F]/g, '');

    // Replace risky characters with underscores
    cleanName = cleanName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Prevent hidden files or leading dot trickery
    cleanName = cleanName.replace(/^\.+/, '');

    if (!cleanName || cleanName.length === 0) {
      return 'document';
    }

    // Limit maximum filename length
    if (cleanName.length > 255) {
      const ext = this.getExtension(cleanName);
      const base = cleanName.substring(0, 240);
      cleanName = ext ? `${base}.${ext}` : base;
    }

    return cleanName;
  }

  /**
   * Extracts extension in lowercase without leading dot.
   */
  public static getExtension(filename: string): string {
    if (!filename) return '';
    const parts = filename.toLowerCase().split('.');
    if (parts.length <= 1) return '';
    return parts.pop() || '';
  }

  /**
   * Validates file size.
   */
  public static validateFileSize(sizeBytes: number): void {
    if (!sizeBytes || sizeBytes <= 0) {
      throw new ToolError('EMPTY_FILE');
    }
    if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
      throw new ToolError('FILE_TOO_LARGE');
    }
  }

  /**
   * Validates target conversion request.
   */
  public static validateSupportedConversion(sourceExt: string, targetExt: string): void {
    const sourceLower = sourceExt.toLowerCase();
    const targetLower = targetExt.toLowerCase();

    const allowedTargets = SUPPORTED_CONVERSIONS[sourceLower];
    if (!allowedTargets || !allowedTargets.includes(targetLower)) {
      throw new ToolError('UNSUPPORTED_CONVERSION');
    }
  }

  /**
   * Multi-stage file signature (magic bytes) validation.
   */
  public static validateFileSignature(buffer: Buffer, extension: string): void {
    if (!buffer || buffer.length === 0) {
      throw new ToolError('EMPTY_FILE');
    }

    const ext = extension.toLowerCase();

    // PDF check: %PDF-
    if (ext === 'pdf') {
      const header = buffer.slice(0, 5).toString('ascii');
      if (header !== '%PDF-') {
        throw new ToolError('INVALID_FILE_SIGNATURE', 'Invalid PDF signature');
      }
      return;
    }

    // ZIP based formats: DOCX, XLSX, PPTX, ODT, ODS, ODP
    if (['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
      const headerHex = buffer.slice(0, 4).toString('hex').toUpperCase();
      // ZIP magic numbers: PK\x03\x04 (504B0304) or PK\x05\x06 (504B0506) or PK\x07\x08 (504B0708)
      if (!['504B0304', '504B0506', '504B0708'].includes(headerHex)) {
        throw new ToolError('INVALID_FILE_SIGNATURE', `Invalid file signature for .${ext}`);
      }

      // Structural check: Ensure it is an Office/OpenDocument package by checking for core XML markers
      const bufferString = buffer.toString('binary', 0, Math.min(buffer.length, 2048));
      const hasXmlMarkers =
        bufferString.includes('[Content_Types].xml') ||
        bufferString.includes('mimetype') ||
        bufferString.includes('word/') ||
        bufferString.includes('xl/') ||
        bufferString.includes('ppt/') ||
        bufferString.includes('META-INF/');

      if (!hasXmlMarkers && buffer.length > 512) {
        throw new ToolError('INVALID_FILE_SIGNATURE', `File does not appear to be a valid .${ext} package`);
      }
      return;
    }

    // Legacy OLE Binary Compound files: DOC, XLS, PPT
    if (['doc', 'xls', 'ppt'].includes(ext)) {
      const headerHex = buffer.slice(0, 8).toString('hex').toUpperCase();
      // OLE header: D0CF11E0A1B11AE1
      if (!headerHex.startsWith('D0CF11E0')) {
        throw new ToolError('INVALID_FILE_SIGNATURE', `Invalid binary Office signature for .${ext}`);
      }
      return;
    }

    // TXT check: ensure no raw binary control characters or null bytes in header
    if (ext === 'txt') {
      const sample = buffer.slice(0, Math.min(buffer.length, 1024));
      for (let i = 0; i < sample.length; i++) {
        const byte = sample[i];
        if (byte === 0) {
          throw new ToolError('INVALID_FILE_SIGNATURE', 'Text file contains null binary bytes');
        }
      }
      return;
    }
  }

  /**
   * Main entry point to validate incoming file upload.
   */
  public static validateIncomingFile(
    filename: string,
    buffer: Buffer,
    clientMimeType?: string,
    targetFormat = 'pdf'
  ): ValidatedFileInfo {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const extension = this.getExtension(sanitizedFilename);

    if (!extension || !SUPPORTED_INPUT_EXTENSIONS.includes(extension)) {
      throw new ToolError('INVALID_FILE_TYPE');
    }

    this.validateFileSize(buffer.length);
    this.validateSupportedConversion(extension, targetFormat);
    this.validateFileSignature(buffer, extension);

    return {
      originalFilename: filename || sanitizedFilename,
      sanitizedFilename,
      extension,
      mimeType: clientMimeType || 'application/octet-stream',
      sizeBytes: buffer.length,
    };
  }
}
