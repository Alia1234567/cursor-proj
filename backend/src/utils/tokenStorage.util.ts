/**
 * In-memory storage for Google OAuth tokens
 * In production, this should be replaced with a database (Redis, MongoDB, etc.)
 */

interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

// Map to store tokens keyed by user email
const tokenStore = new Map<string, TokenData>();

/**
 * Store Google OAuth tokens for a user
 * @param email - User email (used as key)
 * @param tokens - Token data from Google OAuth
 */
export function storeTokens(email: string, tokens: TokenData): void {
  tokenStore.set(email, tokens);
}

/**
 * Retrieve stored tokens for a user
 * @param email - User email
 * @returns Token data or null if not found
 */
export function getTokens(email: string): TokenData | null {
  return tokenStore.get(email) || null;
}

/**
 * Remove stored tokens for a user (on logout)
 * @param email - User email
 */
export function removeTokens(email: string): void {
  tokenStore.delete(email);
}

/**
 * Check if tokens exist for a user
 * @param email - User email
 * @returns True if tokens exist
 */
export function hasTokens(email: string): boolean {
  return tokenStore.has(email);
}


