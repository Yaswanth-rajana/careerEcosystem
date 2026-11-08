import { TextNormalizer } from './textNormalizer';
import { PdfExtractor } from './pdfExtractor';
import { DocxExtractor } from './docxExtractor';
import { OcrService } from './ocrService';

export interface DocumentExtractionMetadata {
  fileType: 'pdf' | 'docx' | 'txt' | 'unknown';
  characterCount: number;
  wordCount: number;
  pageCount?: number;
  extractionMethod:
    | 'PDF_PARSE_LAYOUT'
    | 'PDF_PARSE_SIMPLE'
    | 'PDF_NATIVE_STREAM'
    | 'PDF_PRINTABLE_CHUNK'
    | 'PDF_HEURISTIC'
    | 'DOCX_STRUCTURED'
    | 'TXT_DECODE'
    | 'OCR_LOCAL'
    | 'FALLBACK';
  ocrUsed: boolean;
  qualityStatus: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  warnings: string[];
  isMultiColumn?: boolean;
  hasCorruptedEncoding?: boolean;
  scannedDocumentDetected?: boolean;
}

export interface DocumentExtractionResult {
  text: string;
  metadata: DocumentExtractionMetadata;
}

export class DocumentExtractionService {
  /**
   * Main unified entry point for extracting and normalizing resume document text
   * across PDF, DOCX, and TXT formats with quality evaluation.
   */
  static async extractDocument(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<DocumentExtractionResult> {
    const detectedType = this.detectDocumentType(buffer, filename, mimeType);
    const warnings: string[] = [];

    let rawText = '';
    let method: DocumentExtractionMetadata['extractionMethod'] = 'FALLBACK';
    let isMultiColumn = false;
    let pageCount: number | undefined;
    let ocrUsed = false;
    let scannedDocumentDetected = false;

    switch (detectedType) {
      case 'pdf': {
        try {
          const pdfResult = await PdfExtractor.extract(buffer);
          rawText = pdfResult.text;
          method = pdfResult.method;
          isMultiColumn = pdfResult.isMultiColumn;
          pageCount = pdfResult.pageCount;
        } catch (pdfErr: any) {
          warnings.push(pdfErr?.message || 'Unable to read this PDF. Please upload a text-based PDF or another supported resume format.');
          rawText = '';
        }

        // Check if PDF has insufficient text and might be scanned / image-based
        if (rawText.trim().length < 50) {
          const ocrAttempt = await OcrService.extractWithOcrFallback(buffer, 'pdf', rawText.trim().length);
          scannedDocumentDetected = ocrAttempt.isScanned;
          if (ocrAttempt.ocrUsed && ocrAttempt.text) {
            rawText = ocrAttempt.text;
            method = 'OCR_LOCAL';
            ocrUsed = true;
          } else if (ocrAttempt.warning) {
            warnings.push(ocrAttempt.warning);
          }
        }
        break;
      }

      case 'docx': {
        rawText = await DocxExtractor.extract(buffer);
        method = 'DOCX_STRUCTURED';
        break;
      }

      case 'txt': {
        try {
          rawText = buffer.toString('utf-8');
          method = 'TXT_DECODE';
        } catch {
          rawText = buffer.toString('latin1');
          method = 'FALLBACK';
          warnings.push('Text file could not be parsed as UTF-8; fell back to Latin-1.');
        }
        break;
      }

      default: {
        // Fallback: check if buffer has printable UTF-8 or Latin text
        const fallbackStr = buffer.toString('utf-8');
        if (fallbackStr.length > 20 && /[a-zA-Z0-9]/.test(fallbackStr)) {
          rawText = fallbackStr;
          method = 'FALLBACK';
        } else {
          throw new Error('Unsupported resume format. Please upload a PDF, DOCX, or TXT document.');
        }
      }
    }

    // Apply unified normalization pipeline
    const normalizedText = TextNormalizer.normalize(rawText);

    // Compute quality metrics
    const characterCount = normalizedText.length;
    const words = normalizedText.match(/\b[A-Za-z0-9+#.-]+\b/g) || [];
    const wordCount = words.length;

    // Check for encoding corruption artifacts (e.g. Unicode replacement character )
    const hasCorruptedEncoding = /[\uFFFD]/.test(normalizedText);
    if (hasCorruptedEncoding) {
      warnings.push('Unicode replacement character (U+FFFD) detected; original file may have encoding flaws.');
    }

    // Determine quality status
    let qualityStatus: DocumentExtractionMetadata['qualityStatus'] = 'HIGH';
    if (characterCount < 50 || wordCount < 10) {
      qualityStatus = 'INSUFFICIENT';
      if (scannedDocumentDetected) {
        warnings.push('Scanned or image-based document detected with insufficient text. Please upload a text-based resume.');
      } else {
        warnings.push('Document contains insufficient readable text (<50 characters).');
      }
    } else if (characterCount < 200 || wordCount < 35 || hasCorruptedEncoding) {
      qualityStatus = 'LOW';
      warnings.push('Low character or word count detected; partial extraction may have occurred.');
    } else if (characterCount < 400 || method === 'PDF_HEURISTIC' || method === 'FALLBACK') {
      qualityStatus = 'MEDIUM';
    }

    const metadata: DocumentExtractionMetadata = {
      fileType: detectedType,
      characterCount,
      wordCount,
      pageCount,
      extractionMethod: method,
      ocrUsed,
      qualityStatus,
      warnings,
      isMultiColumn,
      hasCorruptedEncoding,
      scannedDocumentDetected,
    };

    return {
      text: normalizedText,
      metadata,
    };
  }

  /**
   * Robust document type detection using file extension, MIME type, and magic bytes.
   */
  static detectDocumentType(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): 'pdf' | 'docx' | 'txt' | 'unknown' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mime = (mimeType || '').toLowerCase();
    const hasPdfMagic = buffer.length >= 4 && buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'));

    // 1. PDF detection (%PDF- header or genuine PDF buffer)
    if (hasPdfMagic) {
      return 'pdf';
    }

    // If filename or mime says PDF but buffer has NO %PDF header, check if it is plain text (e.g. unit test runner)
    if (mime === 'application/pdf' || ext === 'pdf') {
      const utf8 = buffer.toString('utf-8');
      if (utf8.length > 20 && /[a-zA-Z0-9]/.test(utf8) && !/[\x00-\x08\x0E-\x1F]/.test(utf8)) {
        return 'txt';
      }
      return 'pdf';
    }

    // 2. DOCX detection (OpenXML ZIP container PK\x03\x04 or MIME/extension)
    if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword' ||
      ext === 'docx' ||
      (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && ext === 'docx')
    ) {
      return 'docx';
    }

    // 3. Plain Text detection
    if (mime.startsWith('text/') || ext === 'txt') {
      return 'txt';
    }

    return 'unknown';
  }
}
