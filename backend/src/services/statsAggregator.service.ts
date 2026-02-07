import { NormalizedEvent } from './calendar.service';

/**
 * Statistics result structure
 */
export interface CalendarStats {
  totalEvents: number;
  averageDuration: number; // in milliseconds
  averageDurationFormatted: string; // Human-readable format
  soloMeetings: number;
  guestMeetings: number;
  busiestDay: {
    day: string;
    count: number;
  };
  totalDuration: number; // Total duration in milliseconds
  totalDurationFormatted: string; // Human-readable format
}

/**
 * Day names for formatting
 */
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Aggregate calendar statistics from normalized events
 * 
 * Why backend aggregation?
 * 1. Reduces API calls - fetch once, aggregate server-side
 * 2. Protects Google API credentials - never exposed to frontend
 * 3. Better performance - single request vs multiple frontend requests
 * 4. Centralized business logic - easier to maintain and update
 * 
 * @param events - Array of normalized calendar events
 * @returns Aggregated statistics
 */
export function aggregateStats(events: NormalizedEvent[]): CalendarStats {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      averageDuration: 0,
      averageDurationFormatted: '0 minutes',
      soloMeetings: 0,
      guestMeetings: 0,
      busiestDay: {
        day: 'N/A',
        count: 0,
      },
      totalDuration: 0,
      totalDurationFormatted: '0 minutes',
    };
  }

  // Count total events
  const totalEvents = events.length;

  // Calculate total and average duration
  // Exclude all-day events from duration calculations (or handle separately)
  const eventsWithDuration = events.filter((e) => !e.isAllDay || e.duration > 0);
  const totalDuration = events.reduce((sum, event) => sum + event.duration, 0);
  const averageDuration = totalDuration / totalEvents;

  // Count solo vs guest meetings
  // Solo: events with no other attendees (only organizer)
  // Guest: events with at least one other attendee
  let soloMeetings = 0;
  let guestMeetings = 0;

  events.forEach((event) => {
    if (event.attendees.length === 0) {
      soloMeetings++;
    } else {
      guestMeetings++;
    }
  });

  // Find busiest day of the week
  // Group events by day of week
  const dayCounts = new Map<number, number>();

  events.forEach((event) => {
    const dayOfWeek = event.start.getDay();
    dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1);
  });

  // Find the day with maximum events
  let maxCount = 0;
  let busiestDayIndex = 0;

  dayCounts.forEach((count, dayIndex) => {
    if (count > maxCount) {
      maxCount = count;
      busiestDayIndex = dayIndex;
    }
  });

  return {
    totalEvents,
    averageDuration,
    averageDurationFormatted: formatDuration(averageDuration),
    soloMeetings,
    guestMeetings,
    busiestDay: {
      day: DAY_NAMES[busiestDayIndex],
      count: maxCount,
    },
    totalDuration,
    totalDurationFormatted: formatDuration(totalDuration),
  };
}

/**
 * Format duration in milliseconds to human-readable string
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted string (e.g., "2 hours 30 minutes")
 */
function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return '0 minutes';
  }
}


