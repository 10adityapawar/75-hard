import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { REMINDER_HOURS, TOTAL_DAYS, WAKE_GRACE_MIN, WAKE_HOUR, currentDay, isTaskDone, taskDefs } from './challenge';
import { addDays, atTime, dateKey } from './dates';
import type { AppState } from './types';

const supported = Platform.OS !== 'web';
const DAYS_AHEAD = 7; // iOS allows 64 pending notifications; 7 days x 4 stays well under

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  if (!supported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function at(date: Date, title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'reminders' },
  });
}

/**
 * Rebuilds every reminder from the current state. Called whenever the
 * state changes, so today's reminders only list what's still unchecked.
 */
export async function rescheduleReminders(state: AppState, now = new Date()) {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { settings, progress } = state;
  if (!settings.remindersEnabled || !progress.startDate || progress.finishedOn) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const today = dateKey(now);
  const tasks = taskDefs(settings).filter((t) => t.id !== 'wake');
  const hhmm = `${WAKE_HOUR}:${String(WAKE_GRACE_MIN).padStart(2, '0')}`;

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = addDays(today, i);
    if (date < progress.startDate) continue;
    const log = i === 0 ? state.logs[date] : undefined;
    // Future days assume the current day number; it's corrected each time the app opens.
    const day = Math.min(currentDay(progress) + i, TOTAL_DAYS);

    const wakeAt = atTime(date, WAKE_HOUR);
    if (wakeAt > now && !isTaskDone(log, 'wake')) {
      await at(wakeAt, `⏰ Day ${day}: 8 AM check-in`, `Open the app and check in before ${hhmm}, or today won't count.`);
    }

    for (const hour of REMINDER_HOURS) {
      const when = atTime(date, hour);
      if (when <= now) continue;
      const left = tasks.filter((t) => !isTaskDone(log, t.id));
      if (left.length === 0) continue;
      const title =
        hour === 21
          ? `🚨 3 hours left: ${left.length} task${left.length > 1 ? 's' : ''} to go`
          : `Day ${day}: ${left.length} task${left.length > 1 ? 's' : ''} left`;
      await at(when, title, left.map((t) => t.title).join(' • '));
    }
  }
}

export async function sendTestNotification() {
  if (!supported) return;
  await at(new Date(Date.now() + 5000), '75 Hard', 'Reminders are working. Stay hard. 💪');
}
