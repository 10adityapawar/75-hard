import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DietRestrictions } from '../../components/DietRestrictions';
import { FoodPicker } from '../../components/FoodPicker';
import { ScanFood } from '../../components/ScanFood';
import { Bar, Button, Card, Screen, Segmented } from '../../components/ui';
import { confirmAction } from '../../lib/confirm';
import { getFood, isAllowed, itemTotals, newItemId, planItems, recommendedPlan } from '../../lib/foods';
import { useStore, useTodayLog } from '../../lib/store';
import { colors, radius } from '../../lib/theme';
import type { Food, MealId, PlanItem } from '../../lib/types';

type Tab = 'today' | 'plan';
type PickerTarget = { kind: 'meal'; meal: MealId; name: string } | { kind: 'extra' } | null;

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default function DietScreen() {
  const { state, update, updateToday } = useStore();
  const log = useTodayLog();
  const [tab, setTab] = useState<Tab>('today');
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [scan, setScan] = useState<PickerTarget>(null);
  const goal = state.settings.proteinGoal;

  // Plan items whose food the person has since removed from their diet are left out of totals and today's list.
  const ok = (it: PlanItem) => {
    const f = getFood(it.foodId);
    return !!f && isAllowed(f, state.settings);
  };
  const allItems = planItems(state.plan);
  const excludedCount = allItems.filter((it) => !ok(it)).length;
  const planTotals = itemTotals(allItems.filter(ok));
  const eaten = [...allItems.filter((i) => ok(i) && log.eatenPlanItems.includes(i.id)), ...log.extraFoods];
  const eatenTotals = itemTotals(eaten);

  const editMeal = (meal: MealId, fn: (items: PlanItem[]) => PlanItem[]) =>
    update((s) => ({ ...s, plan: { meals: s.plan.meals.map((m) => (m.id === meal ? { ...m, items: fn(m.items) } : m)) } }));

  const addFood = (target: PickerTarget, food: Food, servings = 1) => {
    const item: PlanItem = { id: newItemId(), foodId: food.id, servings };
    if (target?.kind === 'meal') editMeal(target.meal, (items) => [...items, item]);
    else updateToday((l) => ({ ...l, extraFoods: [...l.extraFoods, item] }));
  };

  const toggleEaten = (id: string) =>
    updateToday((l) => ({
      ...l,
      eatenPlanItems: l.eatenPlanItems.includes(id) ? l.eatenPlanItems.filter((x) => x !== id) : [...l.eatenPlanItems, id],
    }));

  const loadRecommended = () =>
    confirmAction(
      'Replace your plan?',
      'This swaps your current meals for a ~200 g protein day built from the foods you eat.',
      'Replace',
      () => update((s) => ({ ...s, plan: recommendedPlan(s.settings) })),
    );

  const removeExcluded = () =>
    update((s) => ({
      ...s,
      plan: {
        meals: s.plan.meals.map((m) => ({
          ...m,
          items: m.items.filter((it) => {
            const f = getFood(it.foodId);
            return !!f && isAllowed(f, s.settings);
          }),
        })),
      },
    }));

  return (
    <Screen title="Diet" subtitle={`High protein · ${goal} g / day goal`}>
      <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: 'today', label: "Today's food" }, { value: 'plan', label: 'Build my plan' }]} />

      {tab === 'today' ? (
        <>
          <Card style={{ gap: 8 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{eatenTotals.protein} g protein</Text>
              <Text style={styles.muted}>{eatenTotals.calories} cal</Text>
            </View>
            <Bar value={eatenTotals.protein / goal} color={colors.success} height={10} />
            <Text style={styles.muted}>
              {eatenTotals.protein >= goal ? 'Protein goal hit 🎯' : `${goal - eatenTotals.protein} g to go. Tap foods as you eat them.`}
            </Text>
          </Card>

          <Button icon="barcode-outline" label="Scan a food barcode" onPress={() => setScan({ kind: 'extra' })} />

          {state.plan.meals.map((meal) =>
            meal.items.filter(ok).length === 0 ? null : (
              <Card key={meal.id} style={{ gap: 4 }}>
                <Text style={styles.mealName}>{meal.name}</Text>
                {meal.items.filter(ok).map((it) => {
                  const f = getFood(it.foodId)!;
                  const done = log.eatenPlanItems.includes(it.id);
                  return (
                    <Pressable key={it.id} onPress={() => toggleEaten(it.id)} style={styles.foodRow}>
                      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={done ? colors.success : colors.muted} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.foodName, done && { color: colors.muted, textDecorationLine: 'line-through' }]}>{f.name}</Text>
                        <Text style={styles.muted}>
                          {fmt(it.servings)} × {f.serving}
                        </Text>
                      </View>
                      <Text style={styles.grams}>{Math.round(f.protein * it.servings)} g</Text>
                    </Pressable>
                  );
                })}
              </Card>
            ),
          )}

          <Card style={{ gap: 4 }}>
            <Text style={styles.mealName}>Extra food (still on-diet)</Text>
            {log.extraFoods.length === 0 ? <Text style={styles.muted}>Ate something else from the food list? Log it here.</Text> : null}
            {log.extraFoods.map((it) => {
              const f = getFood(it.foodId);
              if (!f) return null;
              return (
                <View key={it.id} style={styles.foodRow}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{f.name}</Text>
                    <Text style={styles.muted}>
                      {it.servings === 1 ? f.serving : `${fmt(it.servings)} × ${f.serving}`} · {Math.round(f.calories * it.servings)} cal
                    </Text>
                  </View>
                  <Text style={styles.grams}>{Math.round(f.protein * it.servings)} g</Text>
                  <Pressable hitSlop={10} onPress={() => updateToday((l) => ({ ...l, extraFoods: l.extraFoods.filter((x) => x.id !== it.id) }))}>
                    <Ionicons name="trash-outline" size={20} color={colors.muted} />
                  </Pressable>
                </View>
              );
            })}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <Button small variant="ghost" icon="add" label="Add food" onPress={() => setPicker({ kind: 'extra' })} style={{ flex: 1 }} />
              <Button small variant="ghost" icon="barcode-outline" label="Scan" onPress={() => setScan({ kind: 'extra' })} style={{ flex: 1 }} />
            </View>
          </Card>
        </>
      ) : (
        <>
          <Card style={{ gap: 8 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Plan: {planTotals.protein} g protein</Text>
              <Text style={styles.muted}>{planTotals.calories} cal</Text>
            </View>
            <Bar value={planTotals.protein / goal} color={planTotals.protein >= goal ? colors.success : colors.warning} height={10} />
            <Text style={styles.muted}>
              {planTotals.protein >= goal
                ? `Your plan hits your ${goal} g goal.`
                : `Add ${goal - planTotals.protein} g more protein to reach your ${goal} g goal.`}
            </Text>
          </Card>

          <Card style={{ gap: 10 }}>
            <Text style={styles.mealName}>Remove from my diet</Text>
            <DietRestrictions />
            {excludedCount > 0 ? (
              <View style={styles.allergy}>
                <Ionicons name="alert-circle" size={20} color={colors.warning} />
                <Text style={styles.allergyText}>
                  {excludedCount} food{excludedCount > 1 ? 's' : ''} in your plan {excludedCount > 1 ? 'are' : 'is'} no longer in your diet.
                </Text>
                <Button small variant="secondary" label="Remove" onPress={removeExcluded} />
              </View>
            ) : null}
            <Text style={styles.muted}>Have a food allergy? Always check labels for "may contain" warnings.</Text>
          </Card>

          {state.plan.meals.map((meal) => (
            <Card key={meal.id} style={{ gap: 4 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.muted}>{itemTotals(meal.items.filter(ok)).protein} g</Text>
              </View>
              {meal.items.map((it) => {
                const f = getFood(it.foodId);
                if (!f) return null;
                const allowed = ok(it);
                return (
                  <View key={it.id} style={[styles.foodRow, !allowed && { opacity: 0.6 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.foodName, !allowed && { textDecorationLine: 'line-through' }]}>{f.name}</Text>
                      <Text style={[styles.muted, !allowed && { color: colors.warning }]}>
                        {allowed ? `${fmt(it.servings)} × ${f.serving} · ${Math.round(f.protein * it.servings)} g` : 'Removed from your diet'}
                      </Text>
                    </View>
                    <Stepper
                      onMinus={() =>
                        editMeal(meal.id, (items) =>
                          it.servings <= 0.5 ? items.filter((x) => x.id !== it.id) : items.map((x) => (x.id === it.id ? { ...x, servings: x.servings - 0.5 } : x)),
                        )
                      }
                      onPlus={() => editMeal(meal.id, (items) => items.map((x) => (x.id === it.id ? { ...x, servings: x.servings + 0.5 } : x)))}
                    />
                  </View>
                );
              })}
              <Button small variant="ghost" icon="add" label={`Add to ${meal.name.toLowerCase()}`} onPress={() => setPicker({ kind: 'meal', meal: meal.id, name: meal.name })} style={{ marginTop: 6 }} />
            </Card>
          ))}

          <Button variant="secondary" icon="sparkles" label="Build a recommended plan for me" onPress={loadRecommended} />
        </>
      )}

      <FoodPicker
        visible={picker !== null}
        title={picker?.kind === 'meal' ? `Add to ${picker.name}` : 'Log extra food'}
        onClose={() => setPicker(null)}
        onPick={(food) => {
          addFood(picker, food);
          setPicker(null);
        }}
        onScan={() => {
          setScan(picker);
          setPicker(null);
        }}
      />

      {scan ? (
        <ScanFood
          addLabel={scan.kind === 'meal' ? `Add to ${scan.name.toLowerCase()}` : 'Log it for today'}
          onClose={() => setScan(null)}
          onAdd={(food, servings) => {
            addFood(scan, food, servings);
            setScan(null);
          }}
        />
      ) : null}
    </Screen>
  );
}

function Stepper({ onMinus, onPlus }: { onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onMinus} hitSlop={6} style={styles.stepBtn} accessibilityLabel="Less">
        <Ionicons name="remove" size={18} color={colors.text} />
      </Pressable>
      <Pressable onPress={onPlus} hitSlop={6} style={styles.stepBtn} accessibilityLabel="More">
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  muted: { color: colors.muted, fontSize: 13 },
  mealName: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  foodName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  grams: { color: colors.success, fontWeight: '800', fontSize: 15 },
  allergy: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(255, 214, 10, 0.1)' },
  allergyText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.cardHigh, alignItems: 'center', justifyContent: 'center' },
});
