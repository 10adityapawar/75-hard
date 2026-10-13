import { addDays, atTime } from './dates';
import type { AppState, DayLog, Progress, Settings, TaskId } from './types';

export const TOTAL_DAYS = 75;
export const PENALTY_DAYS = 10;
export const WATER_GOAL_OZ = 128; // 1 gallon
export const WAKE_HOUR = 8;
export const WAKE_GRACE_MIN = 15; // check-in still counts until 8:15
export const REMINDER_HOURS = [12, 18, 21];

export type TaskDef = { id: TaskId; title: string; detail: string };

export function taskDefs(settings: Settings): TaskDef[] {
  return [
    { id: 'wake', title: 'Up by 8:00 AM', detail: 'Check in when the 8 AM alarm goes off' },
    { id: 'workout', title: '45-min workout', detail: 'Any workout, indoors or out' },
    { id: 'outdoor', title: '45-min outdoor workout', detail: 'Must be outside, whatever the weather' },
    { id: 'water', title: 'Drink 1 gallon of water', detail: `${WATER_GOAL_OZ} oz` },
    { id: 'photo', title: 'Progress photo', detail: 'One photo, every day' },
    {
      id: 'custom',
      title: settings.customTaskName || 'Personal goal',
      detail: `At least ${formatMinutes(settings.customTaskMinutes)}`,
    },
    { id: 'diet', title: 'Follow the diet', detail: 'High-protein plan, no cheat meals' },
  ];
}

export function formatMinutes(min: number): string {
  if (min % 60 === 0) return min === 60 ? '1 hour' : `${min / 60} hours`;
  return min > 60 ? `${Math.floor(min / 60)} hr ${min % 60} min` : `${min} min`;
}

export function emptyLog(date: string): DayLog {
  return { date, checks: {}, waterOz: 0, eatenPlanItems: [], extraFoods: [] };
}

export function wakeDeadline(date: string): Date {
  return atTime(date, WAKE_HOUR, WAKE_GRACE_MIN);
}

export function isTaskDone(log: DayLog | undefined, id: TaskId): boolean {
  if (!log) return false;
  switch (id) {
    case 'wake':
      return !!log.wakeWaived || (!!log.wakeCheckIn && !!log.wakeOnTime);
    case 'water':
      return log.waterOz >= WATER_GOAL_OZ;
    case 'photo':
      return !!log.photo;
    default:
      return !!log.checks[id];
  }
}

export function isDayComplete(log: DayLog | undefined, settings: Settings): boolean {
  return taskDefs(settings).every((t) => isTaskDone(log, t.id));
}

/** True once the wake-up check-in can no longer be made on time. */
export function wakeMissed(log: DayLog | undefined, date: string, now: Date): boolean {
  if (log?.wakeWaived) return false;
  if (log?.wakeCheckIn) return !log.wakeOnTime;
  return now > wakeDeadline(date);
}

export function currentDay(progress: Progress): number {
  return Math.min(progress.completed + 1, TOTAL_DAYS);
}

/**
 * Score every finished day between the last scored date and yesterday.
 * A complete day moves you forward one day; a missed day sends you back
 * PENALTY_DAYS (never below Day 1) and resets the streak.
 */
export function settle(state: AppState, today: string): AppState {
  const p = state.progress;
  if (!p.startDate || p.finishedOn) return state;

  let date = p.lastSettled ? addDays(p.lastSettled, 1) : p.startDate;
  if (date >= today) return state;

  let { completed, streak, bestStreak, finishedOn } = p;
  const history = [...p.history];

  while (date < today && !finishedOn) {
    const dayNumber = completed + 1;
    if (isDayComplete(state.logs[date], state.settings)) {
      completed += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      if (completed >= TOTAL_DAYS) finishedOn = date;
      history.push({ date, dayNumber, result: 'done', nextDay: Math.min(completed + 1, TOTAL_DAYS) });
    } else {
      completed = Math.max(0, completed - PENALTY_DAYS);
      streak = 0;
      history.push({ date, dayNumber, result: 'missed', nextDay: completed + 1 });
    }
    date = addDays(date, 1);
  }

  return {
    ...state,
    progress: { ...p, completed, streak, bestStreak, finishedOn, history, lastSettled: addDays(date, -1) },
  };
}

/** Which challenge day a calendar date was (or is) attempted as. */
export function dayNumberFor(state: AppState, date: string, today: string): number | null {
  const entry = state.progress.history.find((h) => h.date === date);
  if (entry) return entry.dayNumber;
  if (date === today && state.progress.startDate && date >= state.progress.startDate) {
    return currentDay(state.progress);
  }
  return null;
}
