import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FixDay } from '../../components/FixDay';
import { Bar, Card, Screen, SectionLabel } from '../../components/ui';
import { PENALTY_DAYS, TOTAL_DAYS, currentDay } from '../../lib/challenge';
import { formatDate } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';
import type { HistoryEntry } from '../../lib/types';

export default function ProgressScreen() {
  const { state } = useStore();
  const { progress } = state;
  const [fixing, setFixing] = useState<HistoryEntry | null>(null);
  const day = progress.finishedOn ? TOTAL_DAYS : currentDay(progress);
  const misses = progress.history.filter((h) => h.result === 'missed').length;
  const daysLeft = TOTAL_DAYS - progress.completed;

  return (
    <Screen title="Progress" subtitle={progress.startDate ? `Started ${formatDate(progress.startDate, { month: 'long', day: 'numeric' })}` : 'Not started yet'}>
      <Card style={{ gap: 12 }}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>Current day</Text>
            <Text style={styles.huge}>
              {day}
              <Text style={styles.of}> / {TOTAL_DAYS}</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>Days left</Text>
            <Text style={styles.mid}>{daysLeft}</Text>
          </View>
        </View>
        <Bar value={progress.completed / TOTAL_DAYS} height={12} />
        <Text style={styles.muted}>{progress.completed} days completed</Text>
      </Card>

      <View style={styles.stats}>
        <Stat icon="flame" color={colors.fire} value={progress.streak} label="Current streak" />
        <Stat icon="trophy" color={colors.warning} value={progress.bestStreak} label="Best streak" />
        <Stat icon="close-circle" color={colors.accent} value={misses} label="Missed days" />
      </View>

      <SectionLabel>The 75 days</SectionLabel>
      <Card>
        <View style={styles.grid}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => {
            const n = i + 1;
            const done = n <= progress.completed;
            const isToday = !progress.finishedOn && n === day && !!progress.startDate;
            return (
              <View key={n} style={styles.cellWrap}>
                <View style={[styles.cell, done && styles.cellDone, isToday && styles.cellToday]}>
                  <Text style={[styles.cellText, done && { color: '#000' }]}>{n}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text style={[styles.muted, { marginTop: 12 }]}>Miss a day and you go back {PENALTY_DAYS} days (never below Day 1).</Text>
      </Card>

      <SectionLabel>History</SectionLabel>
      {progress.history.length === 0 ? (
        <Card>
          <Text style={styles.muted}>Finished days show up here after midnight.</Text>
        </Card>
      ) : (
        <Card style={{ paddingVertical: 4 }}>
          {[...progress.history].reverse().map((h, i) => (
            <Pressable
              key={h.date}
              onPress={h.result === 'missed' ? () => setFixing(h) : undefined}
              disabled={h.result !== 'missed'}
              style={[styles.histRow, i > 0 && styles.histBorder]}
            >
              <Ionicons
                name={h.result === 'done' ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={h.result === 'done' ? colors.success : colors.accent}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.histTitle}>
                  {h.result === 'done' ? `Day ${h.dayNumber} complete` : `Missed Day ${h.dayNumber}, back to Day ${h.nextDay}`}
                </Text>
                <Text style={styles.muted}>{formatDate(h.date, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
              </View>
              {h.result === 'missed' ? <Text style={styles.fix}>Fix</Text> : null}
            </Pressable>
          ))}
        </Card>
      )}
      {progress.history.some((h) => h.result === 'missed') ? (
        <Text style={styles.muted}>Forgot to log something on a missed day? Tap it to fix it.</Text>
      ) : null}

      {fixing ? <FixDay date={fixing.date} dayNumber={fixing.dayNumber} onClose={() => setFixing(null)} /> : null}
    </Screen>
  );
}

function Stat({ icon, color, value, label }: { icon: 'flame' | 'trophy' | 'close-circle'; color: string; value: number; label: string }) {
  return (
    <Card style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.mid}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  huge: { color: colors.text, fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  of: { color: colors.muted, fontSize: 24, fontWeight: '700', letterSpacing: 0 },
  mid: { color: colors.text, fontSize: 28, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 13 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 14, paddingHorizontal: 6 },
  statLabel: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 },
  cellWrap: { width: '10%', aspectRatio: 1, padding: 2 },
  cell: { flex: 1, borderRadius: 6, backgroundColor: colors.cardHigh, alignItems: 'center', justifyContent: 'center' },
  cellDone: { backgroundColor: colors.success },
  cellToday: { borderWidth: 2, borderColor: colors.accent },
  cellText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  histRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12 },
  histBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  fix: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  histTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
