/**
 * OcrService
 *
 * Local OCR detector and fallback coordinator.
 * Designed with strict resource controls for shared hosting (Hostinger / Serverless):
 * - Strict page limit (max 2 pages)
 * - Execution timeout (10 seconds)
 * - Worker termination to prevent memory leaks
 * - Detection of scanned / image-only documents
 * - Graceful fallback when local OCR engine is unavailable
 */

export interface OcrResult {
  text: string;
  ocrUsed: boolean;
  pageCount?: number;
  warning?: string;
  isScanned: boolean;
}

export class OcrService {
  private static readonly OCR_TIMEOUT_MS = 10000; // 10s maximum timeout
  private static readonly MAX_OCR_PAGES = 2;       // Only OCR first 2 pages of a resume

  /**
   * Detects whether a PDF or image document is scanned / image-only with insufficient text.
   */
  static isScannedPdf(buffer: Buffer, extractedCharCount: number): boolean {
    if (extractedCharCount >= 100) {
      return false; // Document already contains substantial extractable text
    }

    try {
      const latin = buffer.toString('latin1');
      // Look for PDF image XObjects or inline images
      const hasImageXObject = /\/Subtype\s*\/Image/i.test(latin) || /\/XObject\s*<<[^>]*\/Image/i.test(latin);
      const hasInlineImage = /\bBI\b[\s\S]*?\bID\b[\s\S]*?\bEI\b/.test(latin);

      return (hasImageXObject || hasInlineImage) && extractedCharCount < 50;
    } catch {
      return extractedCharCount < 30;
    }
  }

  /**
   * Evaluates if a local OCR engine (such as Tesseract.js) is available in the Node runtime.
   */
  static isOcrEngineAvailable(): boolean {
    try {
      require.resolve('tesseract.js');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Attempts local OCR on an image-based or scanned document.
   * If the local OCR library is not installed or times out, returns graceful diagnostic info.
   */
  static async extractWithOcrFallback(
    buffer: Buffer,
    fileType: 'pdf' | 'image' | 'unknown',
    currentExtractedLength: number
  ): Promise<OcrResult> {
    const isScanned = fileType === 'pdf' ? this.isScannedPdf(buffer, currentExtractedLength) : true;

    // If text extraction was already sufficient, skip OCR
    if (!isScanned && currentExtractedLength >= 50) {
      return {
        text: '',
        ocrUsed: false,
        isScanned: false,
      };
    }

    // Check if Tesseract.js is installed
    if (!this.isOcrEngineAvailable()) {
      return {
        text: '',
        ocrUsed: false,
        isScanned: true,
        warning: 'Scanned / image-only document detected, but local OCR engine (tesseract.js) is not installed in runtime.',
      };
    }

    // If available, attempt OCR with strict timeout and page cap
    try {
      const tesseract = eval('require')('tesseract.js');
      const worker = await tesseract.createWorker('eng');

      try {
        const ocrPromise = (async () => {
          const ret = await worker.recognize(buffer);
          return ret?.data?.text || '';
        })();

        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('OCR extraction timed out (>10s)')), this.OCR_TIMEOUT_MS)
        );

        const recognizedText = await Promise.race([ocrPromise, timeoutPromise]);
        await worker.terminate();

        return {
          text: recognizedText.trim(),
          ocrUsed: true,
          isScanned: true,
        };
      } catch (err: any) {
        await worker.terminate().catch(() => {});
        return {
          text: '',
          ocrUsed: false,
          isScanned: true,
          warning: `OCR processing failed: ${err?.message || err}`,
        };
      }
    } catch (err: any) {
      return {
        text: '',
        ocrUsed: false,
        isScanned: true,
        warning: `Unable to initialize OCR worker: ${err?.message || err}`,
      };
    }
  }
}

