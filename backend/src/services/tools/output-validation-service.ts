import { PDFDocument } from 'pdf-lib';
import { ToolError } from './errors';

export interface ValidatedOutputInfo {
  sizeBytes: number;
  isPdf: boolean;
  pageCount: number;
}

export interface OutputValidationDiagnostic {
  jobId: string;
  inputFormat: string;
  outputFormat: string;
  outputSize: number;
  magicBytesHex: string;
  detectedMime: string;
  pdfHeaderValid: boolean;
  pdfParseSuccessful: boolean;
  pageCount: number;
  firstPageAccessible: boolean;
  validationPassed: boolean;
  validationFailureReason: string | null;
}

export class OutputValidationService {
  /**
   * Validates output PDF generated from conversion service using a real PDF parser (pdf-lib).
   *
   * Required validation pipeline:
   * 1. Verify output file exists.
   * 2. Verify output size > 0.
   * 3. Verify first bytes are %PDF-.
   * 4. Load the PDF with a real PDF parser (pdf-lib).
   * 5. Verify the PDF has a valid Pages tree.
   * 6. Verify page count > 0.
   * 7. Verify at least the first page can be accessed successfully.
   * 8. Verify the PDF is not truncated/corrupted.
   * 9. Verify MIME type / output extension.
   * 10. Only then mark the conversion as COMPLETED.
   */
  public static async validatePdfOutput(
    buffer: Buffer,
    jobId = 'unknown',
    inputFormat = 'unknown',
    options?: { outputFormat?: string; expectedMimeType?: string }
  ): Promise<ValidatedOutputInfo> {
    const outputFormat = (options?.outputFormat || 'pdf').toLowerCase();
    const expectedMimeType = (options?.expectedMimeType || 'application/pdf').toLowerCase();

    const diagnostic: OutputValidationDiagnostic = {
      jobId,
      inputFormat,
      outputFormat,
      outputSize: buffer ? buffer.length : 0,
      magicBytesHex: buffer && buffer.length >= 5 ? buffer.slice(0, 5).toString('hex').toUpperCase() : '',
      detectedMime: expectedMimeType,
      pdfHeaderValid: false,
      pdfParseSuccessful: false,
      pageCount: 0,
      firstPageAccessible: false,
      validationPassed: false,
      validationFailureReason: null,
    };

    try {
      // 1. Verify output file exists
      if (!buffer) {
        diagnostic.validationFailureReason = 'Output file does not exist (buffer is null or undefined)';
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      // 2. Verify output size > 0
      if (buffer.length === 0) {
        diagnostic.validationFailureReason = 'Output file size is 0 bytes';
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      // 9. Verify MIME type / output extension
      if (outputFormat !== 'pdf') {
        diagnostic.validationFailureReason = `Invalid output format extension: expected 'pdf', got '${outputFormat}'`;
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      if (expectedMimeType !== 'application/pdf') {
        diagnostic.validationFailureReason = `Invalid output MIME type: expected 'application/pdf', got '${expectedMimeType}'`;
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      // 3. Verify first bytes are %PDF-
      const header = buffer.slice(0, 5).toString('ascii');
      if (header !== '%PDF-') {
        diagnostic.validationFailureReason = `Invalid PDF header magic bytes: expected %PDF-, got ${header}`;
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }
      diagnostic.pdfHeaderValid = true;

      // 4. Load the PDF with a real PDF parser & 8. Verify PDF is not truncated/corrupted
      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        diagnostic.pdfParseSuccessful = true;
      } catch (err: any) {
        diagnostic.validationFailureReason = `PDF parser failed to load document (truncated or corrupted): ${err.message}`;
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      // 5. Verify PDF has a valid Pages tree & 6. Verify page count > 0
      let pageCount = 0;
      try {
        pageCount = pdfDoc.getPageCount();
        diagnostic.pageCount = pageCount;
      } catch (err: any) {
        diagnostic.validationFailureReason = `Failed to read PDF Pages tree: ${err.message}`;
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      if (!pageCount || pageCount < 1) {
        diagnostic.validationFailureReason = 'PDF page count is less than 1 (no valid Pages tree)';
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      // 7. Verify at least the first page can be accessed successfully
      try {
        const firstPage = pdfDoc.getPage(0);
        if (!firstPage) {
          throw new Error('Page 0 object is null or undefined');
        }
        diagnostic.firstPageAccessible = true;
      } catch (err: any) {
        diagnostic.validationFailureReason = `First page access failed: ${err.message}`;
        this.logDiagnostic(diagnostic);
        throw new ToolError('OUTPUT_VALIDATION_FAILED', diagnostic.validationFailureReason);
      }

      // 10. Only then mark the conversion as COMPLETED
      diagnostic.validationPassed = true;
      this.logDiagnostic(diagnostic);

      return {
        sizeBytes: buffer.length,
        isPdf: true,
        pageCount,
      };
    } catch (err: any) {
      if (err instanceof ToolError) throw err;
      throw new ToolError('OUTPUT_VALIDATION_FAILED', err.message || 'Output PDF validation failed');
    }
  }

  private static logDiagnostic(diag: OutputValidationDiagnostic): void {
    console.log('[OUTPUT_VALIDATION_DIAGNOSTIC]', JSON.stringify(diag));
  }
}

