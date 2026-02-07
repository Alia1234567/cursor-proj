import {Request, Response, NextFunction} from 'express';
import {verifyToken, JWTPayload} from '../utils/jwt.util';

/**
 * Extend Express Request to include user info
 */
export interface AuthRequest extends Request {
    user?: JWTPayload;
}

/**
 * Authentication middleware
 * Extracts JWT from HttpOnly cookie and verifies it
 * Attaches user info to request object if valid
 */
export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        // Extract JWT from cookie
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Authentication required. Please login.',
            });
            return;
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            // Invalid or expired token
            res.clearCookie('token');
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token. Please login again.',
            });
            return;
        }

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during authentication',
        });
    }
}


