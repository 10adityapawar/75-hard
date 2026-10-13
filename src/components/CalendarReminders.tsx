import Constants from 'expo-constants';
import { Linking, StyleSheet, Text } from 'react-native';
import { CALENDAR_REMINDERS, googleCalendarUrl } from '../lib/calendar';
import { colors } from '../lib/theme';
import { Button, Card } from './ui';

export function CalendarReminders() {
  const appUrl = typeof window !== 'undefined' ? `${window.location.origin}${Constants.expoConfig?.experiments?.baseUrl ?? ''}/` : '';
  return (
    <Card style={{ gap: 10 }}>
      <Text style={styles.label}>Add daily reminders to Google Calendar</Text>
      <Text style={styles.hint}>
        Tap each one, then tap Save in Google Calendar. Each event repeats every day. Before saving, set its notification to "At time of
        event" so the alert comes right on time. Make sure the Google Calendar app has notifications turned on.
      </Text>
      {CALENDAR_REMINDERS.map((r) => (
        <Button key={r.hour} small variant="secondary" icon="calendar" label={r.label} onPress={() => Linking.openURL(googleCalendarUrl(r, appUrl))} />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontSize: 15, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
});
