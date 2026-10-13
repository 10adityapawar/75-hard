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

  const saveWeight = () => {
    const w = Number(weight);
    if (!(w > 0)) return setWeight(settings.bodyWeightLbs ? String(settings.bodyWeightLbs) : '');
    const g = proteinGoalFor(w);
    setProtein(String(g));
    set({ bodyWeightLbs: w, proteinGoal: g });
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
          onChangeText={setGoal}
          onEndEditing={() => set({ customTaskName: goal.trim() || 'Personal goal' })}
          placeholder="What do you want to work on?"
          placeholderTextColor={colors.muted}
        />
        <Row label="Minutes per day">
          <TextInput
            style={[styles.input, styles.small]}
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="number-pad"
            onEndEditing={() => {
              const m = Math.max(15, Math.round(Number(minutes)) || settings.customTaskMinutes);
              setMinutes(String(m));
              set({ customTaskMinutes: m });
            }}
          />
        </Row>
        <Text style={styles.hint}>Shows on your checklist as "At least {formatMinutes(settings.customTaskMinutes)}".</Text>
      </Card>

      <SectionLabel>Nutrition</SectionLabel>
      <Card style={{ gap: 10 }}>
        <Row label="Body weight (lbs)">
          <TextInput style={[styles.input, styles.small]} value={weight} onChangeText={setWeight} keyboardType="number-pad" onEndEditing={saveWeight} placeholder="—" placeholderTextColor={colors.muted} />
        </Row>
        <Row label="Protein goal (g/day)">
          <TextInput
            style={[styles.input, styles.small]}
            value={protein}
            onChangeText={setProtein}
            keyboardType="number-pad"
            onEndEditing={() => {
              const g = Math.round(Number(protein));
              if (g > 0) set({ proteinGoal: g });
              else setProtein(String(settings.proteinGoal));
            }}
          />
        </Row>
        <Text style={styles.hint}>Entering your weight sets the goal to 1 g per lb. You can change it yourself.</Text>
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
