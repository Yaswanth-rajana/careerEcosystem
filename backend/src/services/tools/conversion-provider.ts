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

export type ProviderJobStatus = 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface AsyncJobCreationResult {
  providerJobId: string;
  status: ProviderJobStatus;
  uploadUrl?: string;
  uploadParameters?: Record<string, any>;
  outputUrl?: string;
  metadata?: Record<string, any>;
}

export interface ProviderJobStatusResult {
  providerJobId: string;
  status: ProviderJobStatus;
  outputUrl?: string;
  errorCode?: string;
  errorMessage?: string;
  processingTimeMs?: number;
  metadata?: Record<string, any>;
}

export interface ConversionProvider {
  readonly name: string;
  supports(sourceFormat: string, targetFormat: string): boolean;
  healthCheck(): Promise<boolean>;
  convertToPdf(inputBuffer: Buffer, options: ConversionOptions): Promise<ConversionResult>;
  createAsyncJob?(options: ConversionOptions, inputBuffer?: Buffer): Promise<AsyncJobCreationResult>;
  getJobStatus?(providerJobId: string): Promise<ProviderJobStatusResult>;
  fetchConvertedPdf?(outputUrl: string, timeoutMs?: number): Promise<Buffer>;
  cancelJob?(providerJobId: string): Promise<void>;
}
