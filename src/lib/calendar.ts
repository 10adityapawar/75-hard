import { REMINDER_HOURS, WAKE_HOUR } from './challenge';
import { addDays, dateKey } from './dates';

export type CalendarReminder = { hour: number; label: string; title: string; details: string };

const pad = (n: number) => String(n).padStart(2, '0');

export const CALENDAR_REMINDERS: CalendarReminder[] = [
  {
    hour: WAKE_HOUR,
    label: '8 AM check-in',
    title: '⏰ 75 Hard: 8 AM check-in',
    details: 'Open 75 Hard and check in before 8:15 AM, or today won\'t count.',
  },
  ...REMINDER_HOURS.map((hour) => ({
    hour,
    label: `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'} task check`,
    title: hour === 21 ? '🚨 75 Hard: 3 hours left' : '75 Hard: check your tasks',
    details:
      hour === 21
        ? 'Last call. Everything must be checked off by midnight or you go back 10 days.'
        : 'Workouts, water, photo, diet, personal goal. Open 75 Hard and check off what you\'ve done.',
  })),
];

/** A Google Calendar "create event" link for a 10-minute event repeating every day. */
export function googleCalendarUrl(r: CalendarReminder, appUrl: string, now = new Date()): string {
  const firstDay = now.getHours() < r.hour ? dateKey(now) : addDays(dateKey(now), 1);
  const ymd = firstDay.replace(/-/g, '');
  const dates = `${ymd}T${pad(r.hour)}0000/${ymd}T${pad(r.hour)}1000`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: r.title,
    dates,
    details: `${r.details}\n\n${appUrl}`,
    recur: 'RRULE:FREQ=DAILY',
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
