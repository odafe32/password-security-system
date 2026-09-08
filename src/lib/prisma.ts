import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure Prisma for Neon's serverless environment:
// - connection_limit: low to avoid exhausting Neon's pool
// - pool_timeout: longer to handle cold starts
// - connect_timeout: longer to handle network issues
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Retry wrapper ─────────────────────────────────────────────────
// Retries a Prisma query with exponential backoff.
// Handles Neon cold starts and temporary connection drops.

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Check if it's a retryable error (connection issues)
      const code = (error as { code?: string }).code;
      const isRetryable =
        code === "P1001" || // Can't reach database server
        code === "P1017" || // Server has closed the connection
        code === "P2024" || // Connection pool timeout
        code === "P1002" || // Timed out fetching a connection
        code === "P1008";   // Operations timed out

      if (!isRetryable || attempt === retries) {
        throw error;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`DB retry ${attempt + 1}/${retries} in ${delay}ms... (${code})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
