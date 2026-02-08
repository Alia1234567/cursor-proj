import { Router, Response } from 'express';
import { getAuthUrl, getTokensFromCode, logoutUser } from '../services/googleAuth.service';
import { generateToken } from '../utils/jwt.util';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * GET /auth/google
 * Redirects user to Google OAuth consent screen
 */
router.get('/google', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize authentication',
    });
  }
});

/**
 * GET /auth/callback
 * Handles OAuth callback from Google
 * Exchanges authorization code for tokens
 * Issues JWT and sets it in HttpOnly cookie
 * Redirects to frontend dashboard
 */
router.get(
  '/callback',
  asyncHandler(async (req, res: Response) => {
    const { code, error } = req.query;

    if (error) {
      // User denied permission or error occurred
      return res.redirect(`${FRONTEND_URL}/login?error=${error}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${FRONTEND_URL}/login?error=missing_code`);
    }

    try {
      // Exchange code for tokens
      const { email, tokens } = await getTokensFromCode(code);

      // Generate JWT token
      const jwtToken = generateToken(email, email);

      // Set JWT in HttpOnly cookie
      const isProduction = process.env.NODE_ENV === 'production';
      
      res.cookie('token', jwtToken, {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: isProduction, // Only send over HTTPS in production
        sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      // Redirect to frontend dashboard
      res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error: any) {
      console.error('Error in OAuth callback:', error);
      res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
    }
  })
);

/**
 * POST /auth/logout
 * Clears JWT cookie and removes Google tokens
 */
router.post(
  '/logout',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const email = req.user?.email;

    if (email) {
      // Remove Google tokens from database
      await logoutUser(email);
    }

    // Clear JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * GET /auth/me
 * Returns current authenticated user info
 */
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    res.json({
      success: true,
      user: {
        email: req.user.email,
        userId: req.user.userId,
      },
    });
  })
);

export default router;


