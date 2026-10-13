import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';
import { emptyLog, settle, wakeDeadline } from './challenge';
import { dateKey } from './dates';
import { recommendedPlan, registerCustomFoods } from './foods';
import { rescheduleReminders } from './notifications';
import { initPhotos } from './photos';
import type { AppState, DayLog } from './types';

const KEY = '75hard.state.v1';

export function initialState(): AppState {
  return {
    version: 1,
    settings: {
      customTaskName: 'Work on my Claude apps',
      customTaskMinutes: 60,
      bodyWeightLbs: null,
      proteinGoal: 180,
      remindersEnabled: true,
    },
    progress: { startDate: null, completed: 0, streak: 0, bestStreak: 0, lastSettled: null, finishedOn: null, history: [] },
    plan: recommendedPlan(),
    logs: {},
  };
}

type Store = {
  state: AppState;
  today: string;
  ready: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  updateToday: (fn: (log: DayLog) => DayLog) => void;
  startChallenge: (startDate: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [today, setToday] = useState(dateKey());
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  // Runs during render so children always see the current scanned foods via getFood().
  registerCustomFoods(state.customFoods);

  // Load saved state, then score any days that ended while the app was closed.
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), initPhotos()])
      .then(([raw]) => {
        const saved = raw ? (JSON.parse(raw) as AppState) : initialState();
        setState(settle(saved, dateKey()));
      })
      .catch(() => setState(initialState()))
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  // Re-check the date whenever the app comes back to the foreground, and at midnight.
  useEffect(() => {
    const refresh = () => {
      const now = dateKey();
      setToday(now);
      setState((s) => settle(s, now));
    };
    const sub = RNAppState.addEventListener('change', (st) => st === 'active' && refresh());
    const timer = setInterval(refresh, 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  // Persist + rebuild reminders after every change.
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
    const t = setTimeout(() => rescheduleReminders(state).catch(() => {}), 400);
    return () => clearTimeout(t);
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const updateToday = useCallback(
    (fn: (log: DayLog) => DayLog) => {
      setState((s) => {
        const date = dateKey();
        const log = s.logs[date] ?? emptyLog(date);
        return { ...s, logs: { ...s.logs, [date]: fn(log) } };
      });
    },
    [],
  );

  const startChallenge = useCallback((startDate: string) => {
    setState((s) => {
      const now = new Date();
      const logs = { ...s.logs };
      // Starting today after the wake-up deadline? Day 1's check-in is waived.
      if (startDate === dateKey(now) && now > wakeDeadline(startDate)) {
        logs[startDate] = { ...(logs[startDate] ?? emptyLog(startDate)), wakeWaived: true };
      }
      return {
        ...s,
        logs,
        progress: { startDate, completed: 0, streak: 0, bestStreak: 0, lastSettled: null, finishedOn: null, history: [] },
      };
    });
  }, []);

  return <Ctx.Provider value={{ state, today, ready, update, updateToday, startChallenge }}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function useTodayLog(): DayLog {
  const { state, today } = useStore();
  return state.logs[today] ?? emptyLog(today);
}
