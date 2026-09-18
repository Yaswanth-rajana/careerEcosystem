export interface ConversionOptions {
  jobId: string;
  sourceFormat: string;
  targetFormat: string;
  originalFilename: string;
  mimeType?: string;
  timeoutMs?: number;
}

export interface ConversionResult {
  pdfBuffer: Buffer;
  processingTimeMs: number;
}

export interface ConversionProvider {
  convertToPdf(inputBuffer: Buffer, options: ConversionOptions): Promise<ConversionResult>;
  supports(sourceFormat: string, targetFormat: string): boolean;
  healthCheck(): Promise<boolean>;
}
