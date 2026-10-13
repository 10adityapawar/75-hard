import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Onboarding } from '../../components/Onboarding';
import { CalendarReminders } from '../../components/CalendarReminders';
import { TaskRow } from '../../components/TaskRow';
import { Bar, Button, Card, Screen } from '../../components/ui';
import {
  PENALTY_DAYS, TOTAL_DAYS, WATER_GOAL_OZ, currentDay, isTaskDone, taskDefs, wakeDeadline, wakeMissed,
} from '../../lib/challenge';
import { addDays, formatDate, formatTime } from '../../lib/dates';
import { itemTotals, planItems } from '../../lib/foods';
import { capturePhoto, deletePhoto, photoUri } from '../../lib/photos';
import { useStore, useTodayLog } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

function useNow(ms = 30_000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export default function TodayScreen() {
  const { state, today, update, updateToday } = useStore();
  const log = useTodayLog();
  const now = useNow();
  const { progress, settings } = state;

  if (!progress.startDate) return <Onboarding />;

  if (progress.startDate > today) {
    return (
      <Screen title="75 Hard" subtitle={`Starts ${formatDate(progress.startDate, { weekday: 'long', month: 'short', day: 'numeric' })}`}>
        <Card>
          <Text style={styles.big}>Get ready.</Text>
          <Text style={styles.body}>
            Day 1 starts tomorrow. Your first check-in is at 8:00 AM. Check your diet plan in the Diet tab and buy groceries tonight.
          </Text>
        </Card>
      </Screen>
    );
  }

  if (progress.finishedOn) {
    return (
      <Screen title="75 Hard" subtitle="Challenge complete">
        <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 32 }}>
          <Text style={{ fontSize: 64 }}>🏆</Text>
          <Text style={styles.big}>You did it.</Text>
          <Text style={[styles.body, { textAlign: 'center' }]}>
            75 days, finished {formatDate(progress.finishedOn, { month: 'long', day: 'numeric' })}. Best streak: {progress.bestStreak} days.
          </Text>
          <Button label="See your transformation" icon="images" onPress={() => router.navigate('/photos')} />
        </Card>
      </Screen>
    );
  }

  const day = currentDay(progress);
  const tasks = taskDefs(settings);
  const doneCount = tasks.filter((t) => isTaskDone(log, t.id)).length;
  const allDone = doneCount === tasks.length;
  const lost = wakeMissed(log, today, now);
  const last = progress.history[progress.history.length - 1];
  const missedYesterday = last?.result === 'missed' && last.date === addDays(today, -1);
  const protein = itemTotals([
    ...planItems(state.plan).filter((i) => log.eatenPlanItems.includes(i.id)),
    ...log.extraFoods,
  ]).protein;

  const toggle = (id: 'workout' | 'outdoor' | 'custom' | 'diet') =>
    updateToday((l) => ({ ...l, checks: { ...l.checks, [id]: !l.checks[id] } }));

  const addWater = (oz: number) => updateToday((l) => ({ ...l, waterOz: Math.max(0, Math.min(l.waterOz + oz, 256)) }));

  const checkIn = () => {
    const at = new Date();
    updateToday((l) => ({ ...l, wakeCheckIn: at.toISOString(), wakeOnTime: at <= wakeDeadline(today) }));
  };

  const takePhoto = async (source: 'camera' | 'library') => {
    const name = await capturePhoto(today, source);
    if (!name) return;
    deletePhoto(log.photo);
    updateToday((l) => ({ ...l, photo: name }));
  };

  const photoMenu = () =>
    Platform.OS === 'web'
      ? takePhoto('library') // the iPhone file picker already offers Take Photo or Photo Library
      : Alert.alert('Progress photo', undefined, [
      { text: 'Take photo', onPress: () => takePhoto('camera') },
      { text: 'Choose from library', onPress: () => takePhoto('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const streakBadge = (
    <View style={styles.streak}>
      <Ionicons name="flame" size={18} color={colors.fire} />
      <Text style={styles.streakText}>{progress.streak}</Text>
    </View>
  );

  return (
    <Screen title={`Day ${day}`} subtitle={`of ${TOTAL_DAYS} · ${formatDate(today, { weekday: 'long', month: 'short', day: 'numeric' })}`} right={streakBadge}>
      {Platform.OS === 'web' && !settings.calendarPromptDismissed && (
        <View>
          <CalendarReminders />
          <Pressable
            onPress={() => update((s) => ({ ...s, settings: { ...s.settings, calendarPromptDismissed: true } }))}
            style={{ alignSelf: 'center', padding: 10 }}
          >
            <Text style={styles.muted}>Done, hide this (it's also in Settings)</Text>
          </Pressable>
        </View>
      )}

      {missedYesterday && (
        <View style={[styles.banner, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="alert-circle" size={20} color={colors.accent} />
          <Text style={styles.bannerText}>
            You missed Day {last.dayNumber} yesterday, so you're back {PENALTY_DAYS} days to Day {last.nextDay}. Keep going.
          </Text>
        </View>
      )}

      <Card style={{ gap: 10 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{allDone ? 'Day complete 💪' : `${doneCount} of ${tasks.length} done`}</Text>
          <Text style={styles.muted}>{Math.round((progress.completed / TOTAL_DAYS) * 100)}% of 75</Text>
        </View>
        <Bar value={doneCount / tasks.length} color={allDone ? colors.success : colors.accent} />
        {lost && !allDone ? (
          <Text style={[styles.muted, { color: colors.accent }]}>
            You missed the 8 AM check-in, so today won't count. Finish everything anyway.
          </Text>
        ) : !allDone ? (
          <Text style={styles.muted}>Everything must be checked off by midnight.</Text>
        ) : null}
      </Card>

      <TaskRow
        icon="alarm"
        title="Up by 8:00 AM"
        done={isTaskDone(log, 'wake')}
        detail={
          log.wakeWaived ? 'Waived on Day 1 (you started after 8 AM)'
          : log.wakeCheckIn ? `Checked in at ${formatTime(log.wakeCheckIn)}${log.wakeOnTime ? '' : ', too late'}`
          : lost ? 'Missed: no check-in by 8:15 AM'
          : 'Check in by 8:15 AM'
        }
      >
        {!log.wakeCheckIn && !log.wakeWaived && !lost ? <Button label="I'm up. Check in." icon="sunny" onPress={checkIn} /> : null}
      </TaskRow>

      <TaskRow icon="barbell" title="45-min workout" detail="Indoors or out" done={!!log.checks.workout} onPress={() => toggle('workout')} />
      <TaskRow icon="partly-sunny" title="45-min outdoor workout" detail="Must be outside" done={!!log.checks.outdoor} onPress={() => toggle('outdoor')} />

      <TaskRow icon="water" title="1 gallon of water" detail={`${log.waterOz} / ${WATER_GOAL_OZ} oz`} done={isTaskDone(log, 'water')}>
        <Bar value={log.waterOz / WATER_GOAL_OZ} color={colors.water} height={10} />
        <View style={styles.waterBtns}>
          <Button small variant="secondary" label="−8" onPress={() => addWater(-8)} style={{ flex: 1 }} />
          <Button small variant="secondary" label="+8 oz" onPress={() => addWater(8)} style={{ flex: 1 }} />
          <Button small variant="secondary" label="+16 oz" onPress={() => addWater(16)} style={{ flex: 1 }} />
          <Button small variant="secondary" label="+32 oz" onPress={() => addWater(32)} style={{ flex: 1 }} />
        </View>
      </TaskRow>

      <TaskRow icon="camera" title="Progress photo" detail={log.photo ? 'Saved for today' : 'Same pose and spot each day works best'} done={!!log.photo}>
        {log.photo ? (
          <View style={styles.photoRow}>
            <Image source={{ uri: photoUri(log.photo) }} style={styles.thumb} />
            <Button small variant="ghost" label="Retake" icon="refresh" onPress={photoMenu} />
          </View>
        ) : (
          <Button label="Add today's photo" icon="camera" onPress={photoMenu} />
        )}
      </TaskRow>

      <TaskRow
        icon="code-slash"
        title={tasks.find((t) => t.id === 'custom')!.title}
        detail={tasks.find((t) => t.id === 'custom')!.detail}
        done={!!log.checks.custom}
        onPress={() => toggle('custom')}
      />

      <TaskRow
        icon="nutrition"
        title="Followed the diet, no cheat meals"
        detail={`Protein logged: ${protein} / ${settings.proteinGoal} g`}
        done={!!log.checks.diet}
        onPress={() => toggle('diet')}
      >
        <Button small variant="ghost" label="Log today's food" icon="restaurant" onPress={() => router.navigate('/diet')} />
      </TaskRow>
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { color: colors.text, fontSize: 26, fontWeight: '800' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },
  muted: { color: colors.muted, fontSize: 13 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, marginBottom: 6 },
  streakText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  banner: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, alignItems: 'center' },
  bannerText: { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
  waterBtns: { flexDirection: 'row', gap: 8 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 72, height: 96, borderRadius: radius.sm, backgroundColor: colors.cardHigh },
});
