export const MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '25', 10);
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const CONVERSION_TIMEOUT_MS = parseInt(process.env.CONVERSION_TIMEOUT_MS || '60000', 10);
export const FILE_RETENTION_MINUTES = parseInt(process.env.FILE_RETENTION_MINUTES || '60', 10);
export const JOB_METADATA_RETENTION_HOURS = parseInt(process.env.JOB_METADATA_RETENTION_HOURS || '24', 10);

export const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:3001';
export const STORAGE_PROVIDER_TYPE = process.env.STORAGE_PROVIDER || 'local';

export const CONVERSION_PROVIDER = process.env.CONVERSION_PROVIDER || (process.env.CLOUDCONVERT_API_KEY ? 'cloudconvert' : 'mock');
export const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY || '';
export const CLOUDCONVERT_WEBHOOK_SECRET = process.env.CLOUDCONVERT_WEBHOOK_SECRET || '';
export const CLOUDCONVERT_SANDBOX = process.env.CLOUDCONVERT_SANDBOX === 'true';
export const CLOUDCONVERT_API_URL = CLOUDCONVERT_SANDBOX
  ? 'https://api.sandbox.cloudconvert.com/v2'
  : (process.env.CLOUDCONVERT_API_URL || 'https://api.cloudconvert.com/v2');

export const SUPPORTED_CONVERSIONS: Record<string, string[]> = {
  doc: ['pdf'],
  docx: ['pdf'],
  xls: ['pdf'],
  xlsx: ['pdf'],
  ppt: ['pdf'],
  pptx: ['pdf'],
  odt: ['pdf'],
  ods: ['pdf'],
  odp: ['pdf'],
  txt: ['pdf'],
};

export const SUPPORTED_INPUT_EXTENSIONS = Object.keys(SUPPORTED_CONVERSIONS);

export const EXTENSION_MIME_MAP: Record<string, string[]> = {
  doc: ['application/msword'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
  ],
  xls: ['application/vnd.ms-excel'],
  xlsx: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
  ],
  ppt: ['application/vnd.ms-powerpoint'],
  pptx: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
  ],
  odt: ['application/vnd.oasis.opendocument.text', 'application/zip'],
  ods: ['application/vnd.oasis.opendocument.spreadsheet', 'application/zip'],
  odp: ['application/vnd.oasis.opendocument.presentation', 'application/zip'],
  txt: ['text/plain'],
  pdf: ['application/pdf'],
};
