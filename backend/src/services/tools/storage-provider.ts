import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { STORAGE_PROVIDER_TYPE } from './constants';
import { ToolError } from './errors';

export interface StorageMetadata {
  size: number;
  contentType?: string;
  updatedAt?: Date;
}

export interface PresignedUploadData {
  url: string;
  fields?: Record<string, string>;
  key: string;
  expiresInSeconds: number;
}

export interface StorageProvider {
  upload(key: string, data: Buffer, contentType?: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  getMetadata(key: string): Promise<StorageMetadata | null>;
  getSignedUploadUrl?(key: string, contentType: string, expiresInSeconds?: number): Promise<PresignedUploadData | null>;
  getSignedDownloadUrl?(key: string, expiresInSeconds?: number): Promise<string | null>;
}

export class StorageKeyGenerator {
  /**
   * Generates a secure, unpredictable private storage key for input files.
   */
  public static generateInputKey(jobId: string, extension: string): string {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeExt = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin';
    return `conversions/${jobId}/input_${randomHex}.${safeExt}`;
  }

  /**
   * Generates a secure, unpredictable private storage key for output PDF files.
   */
  public static generateOutputKey(jobId: string): string {
    const randomHex = crypto.randomBytes(8).toString('hex');
    return `conversions/${jobId}/output_${randomHex}.pdf`;
  }
}

export class LocalStorageProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(os.tmpdir(), 'pathway-tools');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolvePath(key: string): string {
    // Prevent path traversal outside baseDir
    const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(this.baseDir, safeKey);
    if (!fullPath.startsWith(this.baseDir)) {
      throw new ToolError('STORAGE_ERROR', 'Invalid storage key');
    }
    return fullPath;
  }

  public async upload(key: string, data: Buffer, contentType?: string): Promise<string> {
    try {
      const filePath = this.resolvePath(key);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, data);
      return key;
    } catch (err: any) {
      throw new ToolError('STORAGE_ERROR', `Failed to store file: ${err.message}`);
    }
  }

  public async download(key: string): Promise<Buffer> {
    try {
      const filePath = this.resolvePath(key);
      if (!fs.existsSync(filePath)) {
        throw new ToolError('STORAGE_ERROR', 'File not found in storage');
      }
      return await fs.promises.readFile(filePath);
    } catch (err: any) {
      if (err instanceof ToolError) throw err;
      throw new ToolError('STORAGE_ERROR', `Failed to read file from storage: ${err.message}`);
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const filePath = this.resolvePath(key);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      const filePath = this.resolvePath(key);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        // Clean up parent directory if empty
        const dir = path.dirname(filePath);
        const files = await fs.promises.readdir(dir).catch(() => []);
        if (files.length === 0 && dir !== this.baseDir) {
          await fs.promises.rmdir(dir).catch(() => {});
        }
      }
    } catch {
      // Ignore errors on non-existent file deletion
    }
  }

  public async getMetadata(key: string): Promise<StorageMetadata | null> {
    try {
      const filePath = this.resolvePath(key);
      if (!fs.existsSync(filePath)) return null;
      const stat = await fs.promises.stat(filePath);
      return {
        size: stat.size,
        updatedAt: stat.mtime,
      };
    } catch {
      return null;
    }
  }
}

/**
 * Storage Provider Factory for local vs production object storage.
 */
export class StorageFactory {
  private static instance: StorageProvider | null = null;

  public static getProvider(): StorageProvider {
    if (!this.instance) {
      if (STORAGE_PROVIDER_TYPE === 's3' || STORAGE_PROVIDER_TYPE === 'object') {
        // Falls back safely to LocalStorageProvider if S3 credentials not provided
        this.instance = new LocalStorageProvider();
      } else {
        this.instance = new LocalStorageProvider();
      }
    }
    return this.instance;
  }

  public static setProvider(provider: StorageProvider | null): void {
    this.instance = provider;
  }
}
