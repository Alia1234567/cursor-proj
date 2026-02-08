/**
 * Stores Google Calendar events in the database
 */

import { prisma } from '../lib/prisma';
import type { NormalizedEvent } from './calendar.service';

/**
 * Get userId from email (User table uses cuid, not email as id)
 */
async function getUserIdByEmail(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Save calendar events to database for a user (by email)
 * Upserts events to avoid duplicates (same googleEventId + start)
 */
export async function saveEventsToDb(
  email: string,
  events: NormalizedEvent[]
): Promise<number> {
  const userId = await getUserIdByEmail(email);
  if (!userId) return 0;
  if (events.length === 0) return 0;

  let saved = 0;
  for (const event of events) {
    try {
      await prisma.calendarEvent.upsert({
        where: {
          userId_googleEventId_start: {
            userId,
            googleEventId: event.id,
            start: event.start,
          },
        },
        create: {
          userId,
          googleEventId: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end,
          duration: event.duration,
          attendees: event.attendees,
          isAllDay: event.isAllDay,
        },
        update: {
          summary: event.summary,
          end: event.end,
          duration: event.duration,
          attendees: event.attendees,
          isAllDay: event.isAllDay,
          syncedAt: new Date(),
        },
      });
      saved++;
    } catch (error) {
      console.error('Error saving event to DB:', error);
    }
  }
  return saved;
}

/**
 * Get events from DB for a user (by email) and date range
 */
export async function getEventsFromDb(
  email: string,
  startDate: Date,
  endDate: Date
): Promise<NonNullable<NormalizedEvent>[]> {
  const userId = await getUserIdByEmail(email);
  if (!userId) return [];
  const events = await prisma.calendarEvent.findMany({
    where: {
      userId,
      start: { lt: endDate },
      end: { gt: startDate },
    },
    orderBy: { start: 'asc' },
  });

  return events.map((e) => ({
    id: e.googleEventId,
    summary: e.summary,
    start: e.start,
    end: e.end,
    duration: e.duration,
    attendees: e.attendees,
    isAllDay: e.isAllDay,
    status: 'confirmed',
  }));
}
