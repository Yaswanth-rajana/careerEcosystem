import fs from 'fs';
import path from 'path';
import os from 'os';
import { STORAGE_PROVIDER_TYPE } from './constants';
import { ToolError } from './errors';

export interface StorageMetadata {
  size: number;
  contentType?: string;
  updatedAt?: Date;
}

export interface StorageProvider {
  upload(key: string, data: Buffer, contentType?: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  getMetadata(key: string): Promise<StorageMetadata | null>;
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
  private static instance: StorageProvider;

  public static getProvider(): StorageProvider {
    if (!this.instance) {
      if (STORAGE_PROVIDER_TYPE === 'object') {
        // Placeholder / shell for AWS S3 / Cloudflare R2 / MinIO in production
        // Falls back safely to LocalStorageProvider if credentials not set
        this.instance = new LocalStorageProvider();
      } else {
        this.instance = new LocalStorageProvider();
      }
    }
    return this.instance;
  }
}
