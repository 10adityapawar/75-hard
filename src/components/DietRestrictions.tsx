import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RESTRICTIONS, getFood } from '../lib/foods';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { FoodTag } from '../lib/types';

/** Toggle chips for removing food groups, plus the list of individually hidden foods. */
export function DietRestrictions({ showHidden = true }: { showHidden?: boolean }) {
  const { state, update } = useStore();
  const excluded = state.settings.excludedTags ?? [];
  const hidden = state.settings.hiddenFoods ?? [];

  const toggle = (tag: FoodTag) =>
    update((s) => {
      const cur = s.settings.excludedTags ?? [];
      const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
      return { ...s, settings: { ...s.settings, excludedTags: next } };
    });

  const unhide = (id: string) =>
    update((s) => ({ ...s, settings: { ...s.settings, hiddenFoods: (s.settings.hiddenFoods ?? []).filter((f) => f !== id) } }));

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.chips}>
        {RESTRICTIONS.map((r) => {
          const on = excluded.includes(r.id);
          return (
            <Pressable
              key={r.id}
              onPress={() => toggle(r.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              {on ? <Ionicons name="close" size={14} color="#fff" /> : null}
              <Text style={[styles.chipText, on && { color: '#fff' }]}>{r.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        Tap anything you don't eat. Legumes covers beans, lentils, chickpeas, peas, soy and peanuts. Vegetarian? Remove meat, fish and
        shellfish.
      </Text>

      {showHidden && hidden.length > 0 ? (
        <>
          <Text style={styles.sub}>Foods you removed</Text>
          <View style={styles.chips}>
            {hidden.map((id) => (
              <Pressable key={id} onPress={() => unhide(id)} style={[styles.chip, styles.chipOn]} accessibilityLabel={`Add ${getFood(id)?.name} back`}>
                <Text style={[styles.chipText, { color: '#fff' }]}>{getFood(id)?.name ?? id}</Text>
                <Ionicons name="arrow-undo" size={14} color="#fff" />
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>Tap a food to add it back.</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  sub: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 4 },
});
