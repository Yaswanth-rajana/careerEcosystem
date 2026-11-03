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
   * Validates file size against general tool conversion limit.
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
   * Validates resume upload file size (enforces configured 10MB limit).
   */
  public static validateResumeFileSize(sizeBytes: number, limitBytes: number = 10 * 1024 * 1024): void {
    if (!sizeBytes || sizeBytes <= 0) {
      throw new ToolError('EMPTY_FILE');
    }
    if (sizeBytes > limitBytes) {
      throw new ToolError('FILE_TOO_LARGE', `File size exceeds ${Math.round(limitBytes / (1024 * 1024))}MB limit`);
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

    // PDF check: %PDF- (standard allows within first 1024 bytes per ISO 32000-1)
    if (ext === 'pdf') {
      const headerHex = buffer.subarray(0, 4).toString('hex').toUpperCase();
      // Block known executables and archives immediately (MZ, ELF, Mach-O, ZIP)
      if (
        headerHex.startsWith('4D5A') || // Windows PE (EXE/DLL)
        headerHex.startsWith('7F454C46') || // Linux ELF
        headerHex.startsWith('CAFEBA') || // Mach-O fat / Java class
        headerHex.startsWith('CFFAED') || // Mach-O 64-bit
        headerHex.startsWith('504B0304') // ZIP
      ) {
        throw new ToolError('INVALID_FILE_SIGNATURE', 'Invalid PDF signature');
      }

      const sample = buffer.subarray(0, Math.min(buffer.length, 1024));
      const pdfIndex = sample.indexOf(Buffer.from('%PDF-'));
      if (pdfIndex === -1) {
        throw new ToolError('INVALID_FILE_SIGNATURE', 'Invalid PDF signature');
      }

      // If %PDF- does not start at index 0, preamble must only be BOM, whitespace, or %
      if (pdfIndex > 0) {
        const preamble = sample.subarray(0, pdfIndex);
        const isBOMOrWhitespace = preamble.every(
          (b) =>
            b === 0x20 || b === 0x09 || b === 0x0A || b === 0x0D ||
            b === 0xEF || b === 0xBB || b === 0xBF ||
            b === 0x25
        );
        if (!isBOMOrWhitespace) {
          throw new ToolError('INVALID_FILE_SIGNATURE', 'Invalid PDF signature');
        }
      }
      return;
    }

    // Check for password-protected / encrypted Office files:
    // Office encrypts OpenXML files (.docx, .xlsx, .pptx) by wrapping them inside an OLE compound document with "EncryptedPackage"
    if (['docx', 'xlsx', 'pptx'].includes(ext)) {
      const headerHex = buffer.slice(0, 8).toString('hex').toUpperCase();
      if (headerHex.startsWith('D0CF11E0')) {
        const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
        if (sample.includes(Buffer.from('EncryptedPackage')) || sample.includes(Buffer.from('EncryptionInfo'))) {
          throw new ToolError('PASSWORD_PROTECTED_FILE', `Password-protected .${ext} files are not supported`);
        }
      }
    }

    // ZIP based formats: DOCX, XLSX, PPTX, ODT, ODS, ODP
    if (['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'].includes(ext)) {
      const headerHex = buffer.slice(0, 4).toString('hex').toUpperCase();
      // ZIP magic numbers: PK\x03\x04 (504B0304) or PK\x05\x06 (504B0506) or PK\x07\x08 (504B0708)
      if (!['504B0304', '504B0506', '504B0708'].includes(headerHex)) {
        throw new ToolError('INVALID_FILE_SIGNATURE', `Invalid file signature for .${ext}`);
      }

      // Check minimum sensible size for an Office container
      if (buffer.length < 120) {
        throw new ToolError('CORRUPTED_FILE', `The .${ext} package is incomplete or corrupted`);
      }

      // Check for macros (vbaProject.bin) in standard office files
      if (buffer.includes(Buffer.from('vbaProject.bin'))) {
        throw new ToolError('INVALID_FILE_TYPE', 'Macro-enabled office files (.docm/.xlsm/.pptm) are not permitted');
      }

      // Structural check: Ensure it is an Office/OpenDocument package by checking for core XML markers
      const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
      const hasXmlMarkers =
        sample.includes(Buffer.from('[Content_Types].xml')) ||
        sample.includes(Buffer.from('mimetype')) ||
        sample.includes(Buffer.from('word/')) ||
        sample.includes(Buffer.from('xl/')) ||
        sample.includes(Buffer.from('ppt/')) ||
        sample.includes(Buffer.from('META-INF/'));

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

      // Check for encrypted OLE stream
      const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
      if (sample.includes(Buffer.from('EncryptedPackage')) || sample.includes(Buffer.from('EncryptionInfo'))) {
        throw new ToolError('PASSWORD_PROTECTED_FILE', `Password-protected .${ext} files are not supported`);
      }

      if (buffer.length < 512) {
        throw new ToolError('CORRUPTED_FILE', `Binary .${ext} file is truncated or corrupted`);
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
