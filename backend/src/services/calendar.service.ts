import { calendar_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getAuthenticatedClient } from './googleAuth.service';

/**
 * Normalized event structure for easier processing
 */
export interface NormalizedEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  duration: number; // Duration in milliseconds
  attendees: string[]; // Array of attendee emails
  isAllDay: boolean;
  status: string;
}

/**
 * Fetch calendar events for a given date range
 * @param email - User email (to get authenticated client)
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Array of normalized events
 */
export async function fetchCalendarEvents(
  email: string,
  startDate: string,
  endDate: string
): Promise<NormalizedEvent[]> {
  const client = await getAuthenticatedClient(email);
  
  if (!client) {
    throw new Error('User not authenticated. Please login again.');
  }

  const calendar = google.calendar({ version: 'v3', auth: client });

  try {
    // Fetch events from Google Calendar API
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true, // Expand recurring events
      orderBy: 'startTime',
      maxResults: 2500, // Maximum allowed by API
    });

    const events = response.data.items || [];

    // Normalize events and filter out cancelled events
    const normalizedEvents: NormalizedEvent[] = events
      .filter((event) => event.status !== 'cancelled') // Exclude cancelled events
      .map((event) => normalizeEvent(event))
      .filter((event) => event !== null) as NormalizedEvent[];

    return normalizedEvents;
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    
    if (error.code === 401) {
      throw new Error('Authentication expired. Please login again.');
    }
    
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }
}

/**
 * Normalize a Google Calendar event to our standard format
 * @param event - Raw event from Google Calendar API
 * @returns Normalized event or null if invalid
 */
function normalizeEvent(event: calendar_v3.Schema$Event): NormalizedEvent | null {
  if (!event.id || !event.start || !event.end) {
    return null;
  }

  // Parse start and end times
  const start = event.start.dateTime 
    ? new Date(event.start.dateTime)
    : new Date(event.start.date!); // All-day events use date field
  
  const end = event.end.dateTime
    ? new Date(event.end.dateTime)
    : new Date(event.end.date!);

  // Check if it's an all-day event
  const isAllDay = !!event.start.date && !event.start.dateTime;

  // Calculate duration in milliseconds
  // For all-day events, duration is from start of day to end of day
  const duration = isAllDay 
    ? 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    : end.getTime() - start.getTime();

  // Extract attendee emails (excluding the organizer)
  const attendees: string[] = [];
  if (event.attendees) {
    event.attendees.forEach((attendee) => {
      if (attendee.email && attendee.self !== true) {
        // Exclude the event organizer (self)
        attendees.push(attendee.email);
      }
    });
  }

  return {
    id: event.id,
    summary: event.summary || 'No Title',
    start,
    end,
    duration,
    attendees,
    isAllDay,
    status: event.status || 'confirmed',
  };
}


