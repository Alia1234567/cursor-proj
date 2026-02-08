import { Router, Response } from 'express';
import { fetchCalendarEvents } from '../services/calendar.service';
import { aggregateStats } from '../services/statsAggregator.service';
import { saveEventsToDb } from '../services/eventStorage.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';

const router = Router();

// All calendar routes require authentication
router.use(authMiddleware);

/**
 * GET /api/calendar/stats
 * Fetches calendar events for a date range and returns aggregated statistics
 * 
 * Query parameters:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (required)
 * 
 * Returns:
 * - totalEvents: number
 * - averageDuration: number (milliseconds)
 * - averageDurationFormatted: string
 * - soloMeetings: number
 * - guestMeetings: number
 * - busiestDay: { day: string, count: number }
 * - totalDuration: number (milliseconds)
 * - totalDurationFormatted: string
 */
router.get(
  '/stats',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        error: 'User email not found',
      });
    }

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required',
      });
    }

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate must be valid ISO date strings',
      });
    }

    // Validate date format and range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        error: 'startDate must be before endDate',
      });
    }

    // Check date range is reasonable (max 1 year)
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return res.status(400).json({
        success: false,
        error: 'Date range cannot exceed 365 days',
      });
    }

    try {
      // Fetch events from Google Calendar
      const events = await fetchCalendarEvents(email, startDate, endDate);

      // Store events in database (when using PostgreSQL)
      let savedCount = 0;
      try {
        savedCount = await saveEventsToDb(email, events);
      } catch (dbError) {
        console.warn('Could not save events to DB (may be using in-memory):', dbError);
      }

      // Aggregate statistics
      const stats = aggregateStats(events);

      res.json({
        success: true,
        data: stats,
        meta: {
          dateRange: {
            start: startDate,
            end: endDate,
          },
          eventsProcessed: events.length,
          eventsSavedToDb: savedCount,
        },
      });
    } catch (error: any) {
      console.error('Error fetching calendar stats:', error);
      
      // Handle specific error cases
      if (error.message.includes('not authenticated')) {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch calendar statistics',
      });
    }
  })
);

export default router;


