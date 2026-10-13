import { useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { CalendarReminders } from '../../components/CalendarReminders';
import { Button, Card, Screen, SectionLabel } from '../../components/ui';
import { REMINDER_HOURS, formatMinutes } from '../../lib/challenge';
import { confirmAction, showMessage } from '../../lib/confirm';
import { formatDate } from '../../lib/dates';
import { proteinGoalFor } from '../../lib/foods';
import { ensurePermission, sendTestNotification } from '../../lib/notifications';
import { initialState, useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';
import type { Settings } from '../../lib/types';

const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;

export default function SettingsScreen() {
  const { state, update } = useStore();
  const { settings, progress } = state;
  const [goal, setGoal] = useState(settings.customTaskName);
  const [minutes, setMinutes] = useState(String(settings.customTaskMinutes));
  const [weight, setWeight] = useState(settings.bodyWeightLbs ? String(settings.bodyWeightLbs) : '');
  const [protein, setProtein] = useState(String(settings.proteinGoal));

  const set = (patch: Partial<Settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  // Each field saves as soon as it holds a valid value (blur/end-editing events don't fire reliably on web).
  const changeGoal = (t: string) => {
    setGoal(t);
    if (t.trim()) set({ customTaskName: t.trim() });
  };
  const changeMinutes = (t: string) => {
    setMinutes(t);
    const m = Math.round(Number(t));
    if (m >= 15 && m <= 1440) set({ customTaskMinutes: m });
  };
  const changeWeight = (t: string) => {
    setWeight(t);
    const w = Number(t);
    if (w >= 50 && w <= 700) {
      const g = proteinGoalFor(w);
      setProtein(String(g));
      set({ bodyWeightLbs: w, proteinGoal: g });
    }
  };
  const changeProtein = (t: string) => {
    setProtein(t);
    const g = Math.round(Number(t));
    if (g >= 20 && g <= 500) set({ proteinGoal: g });
  };

  const toggleReminders = async (on: boolean) => {
    if (on && !(await ensurePermission())) {
      showMessage('Notifications are off', 'Turn on notifications for this app in iPhone Settings → Notifications.');
      return;
    }
    set({ remindersEnabled: on });
  };

  const restart = () =>
    confirmAction('Restart the challenge?', 'Your day count and streak go back to zero. Photos and food logs are kept.', 'Restart', () =>
      update((s) => ({ ...s, progress: initialState().progress })),
    );

  return (
    <Screen title="Settings">
      <SectionLabel>Personal daily goal</SectionLabel>
      <Card style={{ gap: 10 }}>
        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={changeGoal}
          onBlur={() => setGoal(settings.customTaskName)}
          placeholder="What do you want to work on?"
          placeholderTextColor={colors.muted}
        />
        <Row label="Minutes per day">
          <TextInput
            style={[styles.input, styles.small]}
            value={minutes}
            onChangeText={changeMinutes}
            onBlur={() => setMinutes(String(settings.customTaskMinutes))}
            keyboardType="number-pad"
          />
        </Row>
        <Text style={styles.hint}>Shows on your checklist as "At least {formatMinutes(settings.customTaskMinutes)}" (15 minutes or more).</Text>
      </Card>

      <SectionLabel>Nutrition</SectionLabel>
      <Card style={{ gap: 10 }}>
        <Row label="Body weight (lbs)">
          <TextInput
            style={[styles.input, styles.small]}
            value={weight}
            onChangeText={changeWeight}
            onBlur={() => setWeight(settings.bodyWeightLbs ? String(settings.bodyWeightLbs) : '')}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={colors.muted}
          />
        </Row>
        <Row label="Protein goal (g/day)">
          <TextInput
            style={[styles.input, styles.small]}
            value={protein}
            onChangeText={changeProtein}
            onBlur={() => setProtein(String(settings.proteinGoal))}
            keyboardType="number-pad"
          />
        </Row>
        <Text style={styles.hint}>
          Changing your weight sets the goal to 1 g per lb. Change the protein goal after that to use your own number. Changes save
          as you type.
        </Text>
      </Card>

      <SectionLabel>Reminders</SectionLabel>
      {Platform.OS === 'web' ? (
        <CalendarReminders />
      ) : (
        <Card style={{ gap: 10 }}>
          <Row label="Daily reminders">
            <Switch value={settings.remindersEnabled} onValueChange={toggleReminders} trackColor={{ true: colors.accent }} />
          </Row>
          <Text style={styles.hint}>
            8 AM wake-up check-in, then {REMINDER_HOURS.map(hourLabel).join(', ')} if anything is still unchecked. Reminders only list
            what you haven't done.
          </Text>
          <Button small variant="secondary" icon="notifications" label="Send a test notification" onPress={sendTestNotification} />
        </Card>
      )}

      <SectionLabel>Challenge</SectionLabel>
      <Card style={{ gap: 10 }}>
        <Text style={styles.label}>
          {progress.startDate ? `Started ${formatDate(progress.startDate, { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Not started'}
        </Text>
        {progress.startDate ? <Button variant="danger" icon="refresh" label="Restart challenge" onPress={restart} /> : null}
      </Card>
    </Screen>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: colors.cardHigh, color: colors.text, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  small: { width: 90, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.text, fontSize: 15 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
});
