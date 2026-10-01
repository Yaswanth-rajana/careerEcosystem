import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Automatic fallback environment variable loader for monorepo workspaces
if (!process.env.DATABASE_URL) {
  const candidateEnvPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'admin/.env'),
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '../backend/.env'),
    path.resolve(process.cwd(), '../admin/.env'),
    path.resolve(__dirname, '../../.env'),
  ];

  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            let val = (match[2] || '').trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            if (!process.env[match[1]]) {
              process.env[match[1]] = val;
            }
          }
        }
        if (process.env.DATABASE_URL) break;
      } catch {}
    }
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
