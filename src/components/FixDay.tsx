import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WAKE_HOUR, WATER_GOAL_OZ, emptyLog, isDayComplete, isTaskDone, rescore, taskDefs } from '../lib/challenge';
import { atTime, formatDate } from '../lib/dates';
import { capturePhoto } from '../lib/photos';
import { useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import type { DayLog, TaskId } from '../lib/types';
import { TaskRow } from './TaskRow';
import { Button, type IconName } from './ui';

const ICONS: Record<TaskId, IconName> = {
  wake: 'alarm',
  workout: 'barbell',
  outdoor: 'partly-sunny',
  water: 'water',
  photo: 'camera',
  custom: 'code-slash',
  diet: 'nutrition',
};

/** Correct a past day's checklist (e.g. forgot to log water), then re-score the challenge. Mount it only while open. */
export function FixDay({ date, dayNumber, onClose }: { date: string; dayNumber: number; onClose: () => void }) {
  const { state, today, update } = useStore();
  const [log, setLog] = useState<DayLog>(() => state.logs[date] ?? emptyLog(date));
  const complete = isDayComplete(log, state.settings);

  const toggle = (id: TaskId) =>
    setLog((l) => {
      const done = isTaskDone(l, id);
      switch (id) {
        case 'wake':
          return done
            ? { ...l, wakeCheckIn: undefined, wakeOnTime: undefined, wakeWaived: false }
            : { ...l, wakeCheckIn: atTime(date, WAKE_HOUR).toISOString(), wakeOnTime: true };
        case 'water':
          return { ...l, waterOz: done ? 0 : WATER_GOAL_OZ };
        case 'photo':
          return l; // a photo has to actually be added
        default:
          return { ...l, checks: { ...l.checks, [id]: !done } };
      }
    });

  const addPhoto = async () => {
    const name = await capturePhoto(date, 'library');
    if (name) setLog((l) => ({ ...l, photo: name }));
  };

  const save = () => {
    update((s) => rescore({ ...s, logs: { ...s.logs, [date]: log } }, today));
    onClose();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Fix Day {dayNumber}</Text>
            <Text style={styles.muted}>{formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close-circle" size={30} color={colors.muted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.muted}>Did something but forgot to log it? Tap it to mark it done. Be honest, that’s the whole point.</Text>
          {taskDefs(state.settings).map((t) => {
            const done = isTaskDone(log, t.id);
            return (
              <TaskRow key={t.id} icon={ICONS[t.id]} title={t.title} detail={t.detail} done={done} onPress={t.id === 'photo' ? undefined : () => toggle(t.id)}>
                {t.id === 'photo' && !done ? <Button small variant="secondary" icon="images" label="Add that day's photo" onPress={addPhoto} /> : null}
              </TaskRow>
            );
          })}
          <View style={[styles.banner, complete && { backgroundColor: colors.successSoft }]}>
            <Ionicons name={complete ? 'checkmark-circle' : 'alert-circle'} size={20} color={complete ? colors.success : colors.warning} />
            <Text style={styles.bannerText}>
              {complete ? 'All done. Saving will count this day and recalculate your progress.' : 'Some tasks are still missing, so this day will stay missed.'}
            </Text>
          </View>
          <Button icon="checkmark" label="Save and recalculate" onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  body: { padding: 16, paddingTop: 8, gap: 10 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(255, 214, 10, 0.1)' },
  bannerText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
});
