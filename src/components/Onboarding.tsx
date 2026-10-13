import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PENALTY_DAYS, TOTAL_DAYS } from '../lib/challenge';
import { addDays } from '../lib/dates';
import { proteinGoalFor, recommendedPlan } from '../lib/foods';
import { ensurePermission } from '../lib/notifications';
import { useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import { DietRestrictions } from './DietRestrictions';
import { Button, Card, Screen, SectionLabel } from './ui';

const RULES = [
  'Up by 8:00 AM and check in',
  'Two 45-minute workouts, one outdoors',
  'Drink 1 gallon of water',
  'Take a progress photo',
  'Your personal daily goal',
  'Follow the high-protein diet, no cheat meals',
];

export function Onboarding() {
  const { state, today, update, startChallenge } = useStore();
  const [goal, setGoal] = useState(state.settings.customTaskName);
  const [minutes, setMinutes] = useState(String(state.settings.customTaskMinutes));
  const [weight, setWeight] = useState(state.settings.bodyWeightLbs ? String(state.settings.bodyWeightLbs) : '');

  const start = async (date: string) => {
    const w = Number(weight);
    const mins = Math.max(15, Math.round(Number(minutes)) || 60);
    update((s) => ({
      ...s,
      settings: {
        ...s.settings,
        customTaskName: goal.trim() || 'Personal goal',
        customTaskMinutes: mins,
        bodyWeightLbs: w > 0 ? w : null,
        proteinGoal: w > 0 ? proteinGoalFor(w) : s.settings.proteinGoal,
      },
      plan: recommendedPlan(s.settings), // starter plan built around their restrictions
    }));
    startChallenge(date);
    await ensurePermission();
  };

  return (
    <Screen title="75 Hard" subtitle={`${TOTAL_DAYS} days. No excuses.`}>
      <Card>
        <Text style={styles.h}>Every day, you must:</Text>
        {RULES.map((r, i) => (
          <Text key={r} style={styles.rule}>
            <Text style={{ color: colors.accent, fontWeight: '800' }}>{i + 1}. </Text>
            {r}
          </Text>
        ))}
        <View style={styles.penalty}>
          <Text style={styles.penaltyText}>
            Miss any task and you go back {PENALTY_DAYS} days. Day 30 becomes Day 20. Your streak resets.
          </Text>
        </View>
      </Card>

      <SectionLabel>Your personal daily goal</SectionLabel>
      <Card style={{ gap: 10 }}>
        <TextInput style={styles.input} value={goal} onChangeText={setGoal} placeholder="e.g. Work on my Claude apps" placeholderTextColor={colors.muted} />
        <View style={styles.inline}>
          <Text style={styles.label}>Minutes per day</Text>
          <TextInput style={[styles.input, styles.small]} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" />
        </View>
      </Card>

      <SectionLabel>Protein target</SectionLabel>
      <Card style={{ gap: 6 }}>
        <View style={styles.inline}>
          <Text style={styles.label}>Body weight (lbs)</Text>
          <TextInput style={[styles.input, styles.small]} value={weight} onChangeText={setWeight} keyboardType="number-pad" placeholder="180" placeholderTextColor={colors.muted} />
        </View>
        <Text style={styles.hint}>
          {Number(weight) > 0 ? `Daily target: ${proteinGoalFor(Number(weight))} g protein (1 g per lb).` : 'Sets your daily protein target at 1 g per lb.'}
        </Text>
      </Card>

      <SectionLabel>Foods you don't eat</SectionLabel>
      <Card>
        <DietRestrictions showHidden={false} />
      </Card>

      <Button label="Start today" icon="flame" onPress={() => start(today)} />
      <Button label="Start tomorrow" variant="secondary" onPress={() => start(addDays(today, 1))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 8 },
  rule: { color: colors.text, fontSize: 15, lineHeight: 26 },
  penalty: { marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.accentSoft },
  penaltyText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  input: { backgroundColor: colors.cardHigh, color: colors.text, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  small: { width: 90, textAlign: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.text, fontSize: 15 },
  hint: { color: colors.muted, fontSize: 13 },
});
