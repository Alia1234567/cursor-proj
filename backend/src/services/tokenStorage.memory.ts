/**
 * In-memory token storage (fallback when DATABASE_URL is not set)
 * Use for quick local testing without PostgreSQL
 */

interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

const tokenStore = new Map<string, TokenData>();

export async function storeTokens(
  email: string,
  tokens: TokenData,
  _name?: string
): Promise<void> {
  tokenStore.set(email, tokens);
}

export async function getTokens(email: string): Promise<TokenData | null> {
  return tokenStore.get(email) || null;
}

export async function removeTokens(email: string): Promise<void> {
  tokenStore.delete(email);
}

export async function hasTokens(email: string): Promise<boolean> {
  return tokenStore.has(email);
}

/** For debug endpoint only - returns count of stored tokens */
export function getTokenCount(): number {
  return tokenStore.size;
}
