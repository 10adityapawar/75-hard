import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../lib/theme';
import type { IconName } from './ui';

type Props = {
  icon: IconName;
  title: string;
  detail?: string;
  done: boolean;
  onPress?: () => void;
  children?: ReactNode;
};

export function TaskRow({ icon, title, detail, done, onPress, children }: Props) {
  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.7 }]}
      >
        <View style={[styles.iconWrap, done && { backgroundColor: colors.successSoft }]}>
          <Ionicons name={icon} size={20} color={done ? colors.success : colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, done && styles.titleDone]}>{title}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
        <View style={[styles.check, done && styles.checkDone]}>
          {done ? <Ionicons name="checkmark" size={18} color="#000" /> : null}
        </View>
      </Pressable>
      {children ? <View style={styles.extra}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  rowDone: { borderColor: 'rgba(48, 209, 88, 0.35)' },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardHigh, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  titleDone: { color: colors.success },
  detail: { color: colors.muted, fontSize: 13, marginTop: 2 },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
  extra: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
});
