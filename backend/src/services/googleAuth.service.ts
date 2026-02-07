import {OAuth2Client} from 'google-auth-library';
import {google} from 'googleapis';
import {getTokens, storeTokens, removeTokens} from '../utils/tokenStorage.util';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables');
}

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

/**
 * Generate Google OAuth authorization URL
 * This URL will redirect user to Google consent screen
 * @returns Authorization URL
 */
export function getAuthUrl(): string {
    const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Required to get refresh token
        scope: scopes,
        prompt: 'consent', // Force consent screen to get refresh token
    });
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param code - Authorization code from Google callback
 * @returns User email and tokens
 */
export async function getTokensFromCode(code: string): Promise<{email: string; tokens: any}> {
    try {
        // Exchange code for tokens
        const {tokens} = await oauth2Client.getToken(code);

        // Set credentials for the client
        oauth2Client.setCredentials(tokens);

        // Get user info to extract email
        const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
        const {data} = await oauth2.userinfo.get();

        const email = data.email;
        if (!email) {
            throw new Error('Unable to retrieve user email from Google');
        }

        // Store tokens in memory (keyed by email)
        storeTokens(email, {
            access_token: tokens.access_token!,
            refresh_token: tokens.refresh_token!,
            expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
            scope: tokens.scope || '',
            token_type: tokens.token_type || 'Bearer',
        });

        return {email, tokens};
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        throw error;
    }
}

/**
 * Get authenticated OAuth2 client for a user
 * Automatically refreshes token if expired
 * @param email - User email
 * @returns Authenticated OAuth2Client or null if tokens not found
 */
export async function getAuthenticatedClient(email: string): Promise<OAuth2Client | null> {
    const storedTokens = getTokens(email);

    if (!storedTokens) {
        return null;
    }

    // Create new client instance
    const client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );

    // Set stored tokens
    client.setCredentials({
        access_token: storedTokens.access_token,
        refresh_token: storedTokens.refresh_token,
        expiry_date: storedTokens.expiry_date,
    });

    // Check if token is expired and refresh if needed
    if (storedTokens.expiry_date && storedTokens.expiry_date <= Date.now()) {
        try {
            const {credentials} = await client.refreshAccessToken();

            // Update stored tokens
            storeTokens(email, {
                access_token: credentials.access_token!,
                refresh_token: credentials.refresh_token || storedTokens.refresh_token,
                expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
                scope: credentials.scope || storedTokens.scope,
                token_type: credentials.token_type || 'Bearer',
            });

            client.setCredentials(credentials);
        } catch (error) {
            console.error('Error refreshing token:', error);
            // Remove invalid tokens
            removeTokens(email);
            return null;
        }
    }

    return client;
}

/**
 * Logout user by removing stored tokens
 * @param email - User email
 */
export function logoutUser(email: string): void {
    removeTokens(email);
}


