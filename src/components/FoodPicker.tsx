import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, allowedFoods } from '../lib/foods';
import { useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import type { Food, FoodCategory } from '../lib/types';

type Props = { visible: boolean; title: string; onClose: () => void; onPick: (food: Food) => void };

export function FoodPicker({ visible, title, onClose, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<FoodCategory | 'All'>('All');
  const { state, update } = useStore();
  const { excludedTags, hiddenFoods } = state.settings;
  const allowed = useMemo(() => allowedFoods({ excludedTags, hiddenFoods }), [excludedTags, hiddenFoods]);
  const categories = CATEGORIES.filter((c) => allowed.some((f) => f.category === c));

  const hide = (food: Food) =>
    update((s) => ({ ...s, settings: { ...s.settings, hiddenFoods: [...(s.settings.hiddenFoods ?? []), food.id] } }));

  const foods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allowed.filter((f) => (cat === 'All' || f.category === cat) && (!q || f.name.toLowerCase().includes(q))).sort(
      (a, b) => b.protein - a.protein,
    );
  }, [query, cat, allowed]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close-circle" size={30} color={colors.muted} />
          </Pressable>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Search foods"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.chips}>
          {(['All', ...categories] as const).map((c) => (
            <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipActive]}>
              <Text style={[styles.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <FlatList
          data={foods}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => onPick(item)} style={({ pressed }) => [styles.food, pressed && { opacity: 0.7 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodMeta}>
                  {item.serving} · {item.calories} cal
                </Text>
                {item.note ? <Text style={styles.note}>⚠️ {item.note}</Text> : null}
              </View>
              <View style={styles.protein}>
                <Text style={styles.proteinNum}>{item.protein}g</Text>
                <Text style={styles.proteinLbl}>protein</Text>
              </View>
              <Ionicons name="add-circle" size={28} color={colors.accent} />
              <Pressable onPress={() => hide(item)} hitSlop={8} accessibilityLabel={`Remove ${item.name} from my diet`}>
                <Ionicons name="eye-off-outline" size={20} color={colors.muted} />
              </Pressable>
            </Pressable>
          )}
          ListHeaderComponent={<Text style={styles.tip}>Tap + to add. Tap the eye to remove a food from your diet.</Text>}
          ListEmptyComponent={<Text style={styles.tip}>No foods match. Check your diet restrictions.</Text>}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  tip: { color: colors.muted, fontSize: 13 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  search: { marginHorizontal: 16, backgroundColor: colors.card, color: colors.text, borderRadius: radius.md, padding: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  food: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  foodName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  foodMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  note: { color: colors.warning, fontSize: 12, marginTop: 4 },
  protein: { alignItems: 'center' },
  proteinNum: { color: colors.success, fontSize: 18, fontWeight: '800' },
  proteinLbl: { color: colors.muted, fontSize: 11 },
});
