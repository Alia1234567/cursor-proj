/**
 * PostgreSQL-backed storage for Google OAuth tokens
 * Replaces in-memory storage for production use
 */

import { prisma } from '../lib/prisma';

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

/**
 * Store Google OAuth tokens for a user
 * Creates or updates user and their tokens in database
 */
export async function storeTokens(email: string, tokens: TokenData, name?: string): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name },
    update: name !== undefined ? { name } : {},
  });

  await prisma.oAuthToken.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date),
      scope: tokens.scope,
      tokenType: tokens.token_type,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      expiryDate: new Date(tokens.expiry_date),
      scope: tokens.scope,
      tokenType: tokens.token_type,
    },
  });
}

/**
 * Retrieve stored tokens for a user
 */
export async function getTokens(email: string): Promise<TokenData | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { oauthToken: true },
  });

  if (!user?.oauthToken) {
    return null;
  }

  const { oauthToken } = user;
  return {
    access_token: oauthToken.accessToken,
    refresh_token: oauthToken.refreshToken,
    expiry_date: oauthToken.expiryDate.getTime(),
    scope: oauthToken.scope || '',
    token_type: oauthToken.tokenType,
  };
}

/**
 * Remove stored tokens for a user (on logout)
 */
export async function removeTokens(email: string): Promise<void> {
  await prisma.oAuthToken.deleteMany({
    where: {
      user: { email },
    },
  });
}

/**
 * Check if tokens exist for a user
 */
export async function hasTokens(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { oauthToken: true },
  });
  return !!user?.oauthToken;
}
