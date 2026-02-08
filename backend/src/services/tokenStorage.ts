/**
 * Token storage - uses PostgreSQL when DATABASE_URL is set,
 * otherwise falls back to in-memory storage for quick local testing
 */

import * as memStorage from './tokenStorage.memory';

// Use PostgreSQL only when DATABASE_URL points to a real database (not the build placeholder)
const PLACEHOLDER_URL = 'postgresql://localhost:5432/dummy';
const useDatabase =
  !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL;

// Lazy load DB storage to avoid loading Prisma when DATABASE_URL is not set
function getStorage() {
  if (useDatabase) {
    return require('./tokenStorage.service');
  }
  return memStorage;
}

export const storeTokens = (...args: Parameters<typeof memStorage.storeTokens>) =>
  getStorage().storeTokens(...args);
export const getTokens = (...args: Parameters<typeof memStorage.getTokens>) =>
  getStorage().getTokens(...args);
export const removeTokens = (...args: Parameters<typeof memStorage.removeTokens>) =>
  getStorage().removeTokens(...args);
export const hasTokens = (...args: Parameters<typeof memStorage.hasTokens>) =>
  getStorage().hasTokens(...args);

/** Returns storage mode and counts - for debug endpoint only */
export async function getStorageInfo(): Promise<{
  mode: 'in-memory' | 'postgresql';
  userCount?: number;
  tokenCount: number;
}> {
  if (useDatabase) {
    const { prisma } = await import('../lib/prisma');
    const [userCount, tokenCount] = await Promise.all([
      prisma.user.count(),
      prisma.oAuthToken.count(),
    ]);
    return { mode: 'postgresql', userCount, tokenCount };
  } else {
    const { getTokenCount } = require('./tokenStorage.memory');
    return { mode: 'in-memory', tokenCount: getTokenCount() };
  }
}
