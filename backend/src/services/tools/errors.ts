export type ToolErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'INVALID_FILE_SIGNATURE'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_CONVERSION'
  | 'EMPTY_FILE'
  | 'CORRUPTED_FILE'
  | 'PASSWORD_PROTECTED_FILE'
  | 'CONVERSION_FAILED'
  | 'CONVERSION_TIMEOUT'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'STORAGE_ERROR'
  | 'TOOL_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED_ACCESS'
  | 'EXPIRED'
  | 'JOB_NOT_FOUND';

export class ToolError extends Error {
  public readonly code: ToolErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(code: ToolErrorCode, customDetails?: string) {
    const errorInfo = ERROR_DETAILS[code] || {
      statusCode: 500,
      userMessage: 'An unexpected error occurred during processing.',
    };

    super(customDetails || errorInfo.userMessage);
    this.code = code;
    this.statusCode = errorInfo.statusCode;
    this.userMessage = errorInfo.userMessage;
    Object.setPrototypeOf(this, ToolError.prototype);
  }
}

const ERROR_DETAILS: Record<ToolErrorCode, { statusCode: number; userMessage: string }> = {
  INVALID_FILE_TYPE: {
    statusCode: 400,
    userMessage: 'This file format is not supported for conversion.',
  },
  INVALID_FILE_SIGNATURE: {
    statusCode: 400,
    userMessage: 'The file contents do not match the expected file type.',
  },
  FILE_TOO_LARGE: {
    statusCode: 400,
    userMessage: 'The file exceeds the maximum allowed upload size of 25 MB.',
  },
  UNSUPPORTED_CONVERSION: {
    statusCode: 400,
    userMessage: 'Converting between these specific file formats is not supported.',
  },
  EMPTY_FILE: {
    statusCode: 400,
    userMessage: 'The uploaded file is empty. Please choose a valid document.',
  },
  CORRUPTED_FILE: {
    statusCode: 422,
    userMessage: "We couldn't convert this document. Please try opening and saving the document again, then upload it.",
  },
  PASSWORD_PROTECTED_FILE: {
    statusCode: 422,
    userMessage: 'Password-protected files cannot be processed. Please remove the password protection and try again.',
  },
  CONVERSION_FAILED: {
    statusCode: 500,
    userMessage: 'We encountered an issue while converting your document. Please check the file and try again.',
  },
  CONVERSION_TIMEOUT: {
    statusCode: 504,
    userMessage: 'The conversion process took too long. Please try converting a smaller document.',
  },
  OUTPUT_VALIDATION_FAILED: {
    statusCode: 500,
    userMessage: 'The generated document could not be validated. Please try uploading the document again.',
  },
  STORAGE_ERROR: {
    statusCode: 500,
    userMessage: 'A storage error occurred while processing your file. Please try again shortly.',
  },
  TOOL_UNAVAILABLE: {
    statusCode: 503,
    userMessage: 'Document conversion is temporarily unavailable. Please try again shortly.',
  },
  RATE_LIMITED: {
    statusCode: 429,
    userMessage: 'You have exceeded your conversion request limit. Please wait a moment before trying again.',
  },
  UNAUTHORIZED_ACCESS: {
    statusCode: 403,
    userMessage: 'You do not have permission to access or download this document.',
  },
  EXPIRED: {
    statusCode: 410,
    userMessage: 'This document conversion has expired and is no longer available for download.',
  },
  JOB_NOT_FOUND: {
    statusCode: 404,
    userMessage: 'The requested conversion job was not found.',
  },
};
