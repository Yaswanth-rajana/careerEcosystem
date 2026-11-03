/**
 * Database concurrency and transaction retry utilities for MongoDB replica-set transactions.
 */

export function isWriteConflictError(err: any): boolean {
  if (!err) return false;
  return (
    err.code === 'P2034' || // Transaction failed due to a write conflict or deadlock
    err.code === 'P2028' || // Transaction already closed / expired
    err.code === 'P2002' || // Unique constraint failed during concurrent initialization
    (typeof err.message === 'string' &&
      (err.message.includes('write conflict') ||
        err.message.includes('WriteConflict') ||
        err.message.includes('deadlock') ||
        err.message.includes('Transaction failed due to a write conflict') ||
        err.message.includes('Transaction already closed') ||
        err.message.includes('expired transaction') ||
        err.message.includes('Write conflict') ||
        err.message.includes('Unique constraint failed')))
  );
}

export async function retryOnWriteConflict<T>(
  operation: (attempt: number) => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 50
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation(attempt + 1);
    } catch (err: any) {
      attempt++;
      if (attempt < maxRetries && isWriteConflictError(err)) {
        const base = baseDelayMs * Math.pow(1.8, attempt);
        const jitter = Math.random() * 60;
        const delay = Math.min(800, base + jitter);
        console.warn(
          `[retryOnWriteConflict] Caught transient conflict (${err.code || err.message}). Retrying attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}
