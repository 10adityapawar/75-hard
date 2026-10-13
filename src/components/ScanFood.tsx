import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { extractBarcode, lookupBarcode } from '../lib/barcode';
import { RESTRICTIONS } from '../lib/foods';
import { useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import type { Food, FoodTag } from '../lib/types';
import { BarcodeCamera } from './BarcodeCamera';
import { Button } from './ui';

type Props = { addLabel: string; onClose: () => void; onAdd: (food: Food, servings: number) => void };
type Phase = { kind: 'scan'; error?: string } | { kind: 'loading'; code: string } | { kind: 'found'; food: Food };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const label = (t: FoodTag) => RESTRICTIONS.find((r) => r.id === t)?.label ?? t;

/** Scan a packaged food's barcode, see its nutrition, and save it to My Foods / log it. Mount it only while open. */
export function ScanFood({ addLabel, onClose, onAdd }: Props) {
  const { state, update } = useStore();
  const [phase, setPhase] = useState<Phase>({ kind: 'scan' });
  const [manual, setManual] = useState('');
  const [servings, setServings] = useState(1);
  const busy = useRef(false); // the camera reports the same code many times a second

  const lookup = async (raw: string) => {
    if (busy.current) return;
    const code = extractBarcode(raw);
    if (!code) {
      setPhase({ kind: 'scan', error: "That code doesn't contain a product barcode. Try the barcode (the stripes) on the package." });
      return;
    }
    busy.current = true;
    setPhase({ kind: 'loading', code });
    const res = await lookupBarcode(code);
    if ('error' in res) {
      setPhase({ kind: 'scan', error: res.error });
      // Give the person a moment to move the camera off the code before scanning again.
      setTimeout(() => (busy.current = false), 1500);
    } else {
      setServings(1);
      setPhase({ kind: 'found', food: res.food });
    }
  };

  const save = (food: Food) =>
    update((s) => ({ ...s, customFoods: [food, ...(s.customFoods ?? []).filter((f) => f.id !== food.id)] }));

  const rescan = () => {
    busy.current = false;
    setPhase({ kind: 'scan' });
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan food</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close-circle" size={30} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {phase.kind === 'found' ? (
            <Result
              food={phase.food}
              servings={servings}
              setServings={setServings}
              excluded={state.settings.excludedTags ?? []}
              addLabel={addLabel}
              onAdd={() => {
                save(phase.food);
                onAdd(phase.food, servings);
              }}
              onSave={() => {
                save(phase.food);
                onClose();
              }}
              onRescan={rescan}
            />
          ) : (
            <>
              <BarcodeCamera onScan={lookup} />
              {phase.kind === 'loading' ? (
                <Text style={styles.status}>Looking up {phase.code}…</Text>
              ) : phase.error ? (
                <View style={styles.warn}>
                  <Ionicons name="alert-circle" size={20} color={colors.warning} />
                  <Text style={styles.warnText}>{phase.error}</Text>
                </View>
              ) : (
                <Text style={styles.status}>Point your camera at the barcode on the package.</Text>
              )}
              <Text style={styles.section}>Or type the barcode number</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 0049000028911"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  value={manual}
                  onChangeText={(t) => setManual(t.replace(/\D/g, ''))}
                  onSubmitEditing={() => manual && lookup(manual)}
                />
                <Button small label="Look up" disabled={manual.length < 8 || phase.kind === 'loading'} onPress={() => lookup(manual)} />
              </View>
              <Text style={styles.tip}>Nutrition data comes from Open Food Facts, a free community database. Double-check it against the label.</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

type ResultProps = {
  food: Food;
  servings: number;
  setServings: (n: number) => void;
  excluded: FoodTag[];
  addLabel: string;
  onAdd: () => void;
  onSave: () => void;
  onRescan: () => void;
};

function Result({ food, servings, setServings, excluded, addLabel, onAdd, onSave, onRescan }: ResultProps) {
  const x = (n: number) => fmt(Math.round(n * servings * 10) / 10);
  const conflicts = food.tags.filter((t) => excluded.includes(t));
  const rows: [string, number | undefined, string][] = [
    ['Carbs', food.carbs, 'g'],
    ['Sugar', food.sugar, 'g'],
    ['Fiber', food.fiber, 'g'],
    ['Fat', food.fat, 'g'],
    ['Sodium', food.sodium, 'mg'],
  ];

  return (
    <View style={{ gap: 14 }}>
      <View>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.muted}>
          {food.brand ? `${food.brand} · ` : ''}per {food.serving}
        </Text>
      </View>

      {conflicts.length ? (
        <View style={[styles.warn, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="warning" size={20} color={colors.accent} />
          <Text style={styles.warnText}>Contains {conflicts.map(label).join(', ')}, which you removed from your diet.</Text>
        </View>
      ) : null}

      <View style={styles.stats}>
        <Stat value={x(food.calories)} label="calories" color={colors.fire} />
        <Stat value={`${x(food.protein)}g`} label="protein" color={colors.success} />
      </View>

      <View style={styles.table}>
        {rows.map(([name, v, unit]) =>
          v === undefined ? null : (
            <View key={name} style={styles.tableRow}>
              <Text style={styles.rowName}>{name}</Text>
              <Text style={styles.rowVal}>
                {x(v)} {unit}
              </Text>
            </View>
          ),
        )}
        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.rowName}>Allergens</Text>
          <Text style={[styles.rowVal, { flex: 1, textAlign: 'right' }]}>{food.tags.length ? food.tags.map(label).join(', ') : 'None listed'}</Text>
        </View>
      </View>
      {food.note ? <Text style={[styles.tip, { color: colors.warning }]}>⚠️ {food.note}</Text> : null}

      <View style={styles.servingRow}>
        <Text style={styles.rowName}>Servings</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => setServings(Math.max(0.5, servings - 0.5))} style={styles.stepBtn} accessibilityLabel="Fewer servings">
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.rowVal, { minWidth: 28, textAlign: 'center' }]}>{fmt(servings)}</Text>
          <Pressable onPress={() => setServings(servings + 0.5)} style={styles.stepBtn} accessibilityLabel="More servings">
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <Button icon="add-circle" label={addLabel} onPress={onAdd} />
      <Button variant="secondary" icon="bookmark-outline" label="Just save to My Foods" onPress={onSave} />
      <Button variant="ghost" icon="barcode-outline" label="Scan something else" onPress={onRescan} />
    </View>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  body: { padding: 16, paddingTop: 8, gap: 12 },
  status: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  section: { color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8 },
  input: { flex: 1, backgroundColor: colors.card, color: colors.text, borderRadius: radius.md, padding: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  tip: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  muted: { color: colors.muted, fontSize: 13 },
  warn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(255, 214, 10, 0.1)' },
  warnText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
  foodName: { color: colors.text, fontSize: 22, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800' },
  table: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowName: { color: colors.muted, fontSize: 15 },
  rowVal: { color: colors.text, fontSize: 15, fontWeight: '700' },
  servingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.cardHigh, alignItems: 'center', justifyContent: 'center' },
});
