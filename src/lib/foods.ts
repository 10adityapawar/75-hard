import type { DietPlan, Food, FoodCategory, FoodTag, MealId, PlanItem, Settings } from './types';

/** Things a person can remove from their diet. Each one hides every food with that tag. */
export const RESTRICTIONS: { id: FoodTag; label: string; detail?: string }[] = [
  { id: 'tree-nuts', label: 'Tree nuts', detail: 'almonds, cashews, walnuts…' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'legumes', label: 'Legumes', detail: 'beans, lentils, chickpeas, peas, soy, peanuts' },
  { id: 'soy', label: 'Soy' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'gluten', label: 'Gluten / wheat' },
  { id: 'meat', label: 'Meat & poultry' },
  { id: 'red-meat', label: 'Red meat' },
  { id: 'pork', label: 'Pork' },
  { id: 'vegetables', label: 'Vegetables' },
];

/**
 * High-protein foods plus the sides that go with them. Values are approximate
 * (USDA averages, cooked weights) and brands vary.
 */
export const FOODS: Food[] = [
  // Meat & Poultry
  { id: 'chicken-breast', name: 'Chicken breast', serving: '4 oz cooked', protein: 35, calories: 185, category: 'Meat & Poultry', tags: ['meat'] },
  { id: 'chicken-thigh', name: 'Chicken thigh, skinless', serving: '4 oz cooked', protein: 29, calories: 235, category: 'Meat & Poultry', tags: ['meat'] },
  { id: 'rotisserie-chicken', name: 'Rotisserie chicken, white meat', serving: '4 oz', protein: 32, calories: 190, category: 'Meat & Poultry', tags: ['meat'] },
  { id: 'ground-turkey', name: 'Ground turkey, 93% lean', serving: '4 oz cooked', protein: 30, calories: 240, category: 'Meat & Poultry', tags: ['meat'] },
  { id: 'deli-turkey', name: 'Deli turkey breast', serving: '3 oz', protein: 15, calories: 90, category: 'Meat & Poultry', tags: ['meat'] },
  { id: 'ground-beef', name: 'Ground beef, 93% lean', serving: '4 oz cooked', protein: 30, calories: 220, category: 'Meat & Poultry', tags: ['meat', 'red-meat'] },
  { id: 'sirloin', name: 'Sirloin steak', serving: '4 oz cooked', protein: 33, calories: 210, category: 'Meat & Poultry', tags: ['meat', 'red-meat'] },
  { id: 'bison', name: 'Ground bison', serving: '4 oz cooked', protein: 32, calories: 200, category: 'Meat & Poultry', tags: ['meat', 'red-meat'] },
  { id: 'pork-tenderloin', name: 'Pork tenderloin', serving: '4 oz cooked', protein: 30, calories: 165, category: 'Meat & Poultry', tags: ['meat', 'pork'] },
  // Seafood
  { id: 'salmon', name: 'Salmon', serving: '4 oz cooked', protein: 28, calories: 235, category: 'Seafood', tags: ['fish'] },
  { id: 'tuna-can', name: 'Tuna, canned in water', serving: '1 can, drained', protein: 27, calories: 120, category: 'Seafood', tags: ['fish'] },
  { id: 'cod', name: 'Cod', serving: '4 oz cooked', protein: 26, calories: 120, category: 'Seafood', tags: ['fish'] },
  { id: 'tilapia', name: 'Tilapia', serving: '4 oz cooked', protein: 29, calories: 145, category: 'Seafood', tags: ['fish'] },
  { id: 'shrimp', name: 'Shrimp', serving: '4 oz cooked', protein: 27, calories: 115, category: 'Seafood', tags: ['shellfish'] },
  // Eggs & Dairy
  { id: 'eggs', name: 'Whole eggs', serving: '3 large', protein: 19, calories: 215, category: 'Eggs & Dairy', tags: ['eggs'] },
  { id: 'egg-whites', name: 'Liquid egg whites', serving: '1 cup', protein: 26, calories: 125, category: 'Eggs & Dairy', tags: ['eggs'] },
  { id: 'greek-yogurt', name: 'Greek yogurt, nonfat plain', serving: '1 cup', protein: 23, calories: 130, category: 'Eggs & Dairy', tags: ['dairy'] },
  { id: 'cottage-cheese', name: 'Cottage cheese, low-fat', serving: '1 cup', protein: 28, calories: 180, category: 'Eggs & Dairy', tags: ['dairy'] },
  { id: 'ultra-milk', name: 'Ultra-filtered milk (e.g. Fairlife)', serving: '1 cup', protein: 13, calories: 80, category: 'Eggs & Dairy', tags: ['dairy'] },
  { id: 'milk', name: 'Milk, 1%', serving: '1 cup', protein: 8, calories: 100, category: 'Eggs & Dairy', tags: ['dairy'] },
  { id: 'string-cheese', name: 'String cheese', serving: '1 stick', protein: 7, calories: 80, category: 'Eggs & Dairy', tags: ['dairy'] },
  // Plant Protein
  { id: 'tofu', name: 'Tofu, extra firm', serving: '½ cup', protein: 20, calories: 180, category: 'Plant Protein', tags: ['soy', 'legumes'] },
  { id: 'tempeh', name: 'Tempeh', serving: '3 oz', protein: 17, calories: 160, category: 'Plant Protein', tags: ['soy', 'legumes'] },
  { id: 'edamame', name: 'Edamame, shelled', serving: '1 cup', protein: 18, calories: 190, category: 'Plant Protein', tags: ['soy', 'legumes'] },
  { id: 'seitan', name: 'Seitan', serving: '3 oz', protein: 21, calories: 120, category: 'Plant Protein', tags: ['gluten'] },
  { id: 'lentils', name: 'Lentils', serving: '1 cup cooked', protein: 18, calories: 230, category: 'Plant Protein', tags: ['legumes'] },
  { id: 'black-beans', name: 'Black beans', serving: '1 cup cooked', protein: 15, calories: 227, category: 'Plant Protein', tags: ['legumes'] },
  { id: 'chickpeas', name: 'Chickpeas', serving: '1 cup cooked', protein: 15, calories: 270, category: 'Plant Protein', tags: ['legumes'] },
  { id: 'hummus', name: 'Hummus', serving: '¼ cup', protein: 5, calories: 100, category: 'Plant Protein', tags: ['legumes'] },
  // Shakes & Snacks
  { id: 'whey', name: 'Whey protein shake', serving: '1 scoop', protein: 25, calories: 120, category: 'Shakes & Snacks', tags: ['dairy'], note: 'Check the label if you have allergies. Many are made on shared lines.' },
  { id: 'plant-protein', name: 'Pea protein shake', serving: '1 scoop', protein: 21, calories: 110, category: 'Shakes & Snacks', tags: ['legumes'] },
  { id: 'protein-drink', name: 'Ready-to-drink protein shake', serving: '1 bottle', protein: 30, calories: 160, category: 'Shakes & Snacks', tags: ['dairy'] },
  { id: 'jerky', name: 'Beef jerky', serving: '1 oz', protein: 10, calories: 80, category: 'Shakes & Snacks', tags: ['meat', 'red-meat'], note: 'Some flavors contain soy, wheat or peanuts.' },
  // Nuts & Seeds
  { id: 'peanut-butter', name: 'Peanut butter', serving: '2 tbsp', protein: 7, calories: 190, category: 'Nuts & Seeds', tags: ['peanuts', 'legumes'] },
  { id: 'almonds', name: 'Almonds', serving: '1 oz (23 nuts)', protein: 6, calories: 165, category: 'Nuts & Seeds', tags: ['tree-nuts'] },
  { id: 'almond-butter', name: 'Almond butter', serving: '2 tbsp', protein: 7, calories: 195, category: 'Nuts & Seeds', tags: ['tree-nuts'] },
  { id: 'pumpkin-seeds', name: 'Pumpkin seeds', serving: '1 oz', protein: 9, calories: 160, category: 'Nuts & Seeds', tags: [] },
  { id: 'hemp-hearts', name: 'Hemp hearts', serving: '3 tbsp', protein: 10, calories: 170, category: 'Nuts & Seeds', tags: [] },
  { id: 'chia', name: 'Chia seeds', serving: '2 tbsp', protein: 5, calories: 140, category: 'Nuts & Seeds', tags: [] },
  // Grains
  { id: 'white-rice', name: 'White rice', serving: '1 cup cooked', protein: 4, calories: 205, category: 'Grains', tags: [] },
  { id: 'brown-rice', name: 'Brown rice', serving: '1 cup cooked', protein: 5, calories: 215, category: 'Grains', tags: [] },
  { id: 'quinoa', name: 'Quinoa', serving: '1 cup cooked', protein: 8, calories: 220, category: 'Grains', tags: [] },
  { id: 'oats', name: 'Oats', serving: '½ cup dry', protein: 5, calories: 150, category: 'Grains', tags: [], note: 'Buy certified gluten-free oats if you avoid gluten.' },
  { id: 'pasta', name: 'Pasta (wheat)', serving: '1 cup cooked', protein: 8, calories: 200, category: 'Grains', tags: ['gluten'] },
  { id: 'wheat-bread', name: 'Whole wheat bread', serving: '2 slices', protein: 8, calories: 160, category: 'Grains', tags: ['gluten'] },
  { id: 'bagel', name: 'Plain bagel', serving: '1 bagel', protein: 10, calories: 270, category: 'Grains', tags: ['gluten'] },
  { id: 'tortilla', name: 'Flour tortilla, large', serving: '1 tortilla', protein: 5, calories: 140, category: 'Grains', tags: ['gluten'] },
  { id: 'rice-cakes', name: 'Rice cakes', serving: '2 cakes', protein: 2, calories: 70, category: 'Grains', tags: [] },
  // Vegetables
  { id: 'broccoli', name: 'Broccoli', serving: '1 cup cooked', protein: 4, calories: 55, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'spinach', name: 'Spinach', serving: '1 cup cooked', protein: 5, calories: 40, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'asparagus', name: 'Asparagus', serving: '1 cup cooked', protein: 4, calories: 40, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'brussels', name: 'Brussels sprouts', serving: '1 cup cooked', protein: 4, calories: 56, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'green-peas', name: 'Green peas', serving: '1 cup cooked', protein: 8, calories: 125, category: 'Vegetables', tags: ['vegetables', 'legumes'] },
  { id: 'green-beans', name: 'Green beans', serving: '1 cup cooked', protein: 2, calories: 44, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'sweet-potato', name: 'Sweet potato', serving: '1 medium', protein: 2, calories: 105, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'potato', name: 'Baked potato', serving: '1 medium', protein: 4, calories: 160, category: 'Vegetables', tags: ['vegetables'] },
  { id: 'salad', name: 'Mixed salad greens', serving: '2 cups', protein: 1, calories: 15, category: 'Vegetables', tags: ['vegetables'] },
  // Fruit
  { id: 'banana', name: 'Banana', serving: '1 medium', protein: 1, calories: 105, category: 'Fruit', tags: [] },
  { id: 'blueberries', name: 'Blueberries', serving: '1 cup', protein: 1, calories: 85, category: 'Fruit', tags: [] },
  { id: 'strawberries', name: 'Strawberries', serving: '1 cup', protein: 1, calories: 50, category: 'Fruit', tags: [] },
  { id: 'apple', name: 'Apple', serving: '1 medium', protein: 0.5, calories: 95, category: 'Fruit', tags: [] },
  { id: 'orange', name: 'Orange', serving: '1 medium', protein: 1, calories: 60, category: 'Fruit', tags: [] },
  { id: 'pineapple', name: 'Pineapple', serving: '1 cup', protein: 1, calories: 80, category: 'Fruit', tags: [] },
  { id: 'mango', name: 'Mango', serving: '1 cup', protein: 1.5, calories: 100, category: 'Fruit', tags: [] },
  { id: 'grapes', name: 'Grapes', serving: '1 cup', protein: 1, calories: 105, category: 'Fruit', tags: [] },
];

export const CATEGORIES: FoodCategory[] = [
  'Meat & Poultry', 'Seafood', 'Eggs & Dairy', 'Plant Protein', 'Shakes & Snacks', 'Nuts & Seeds', 'Grains', 'Vegetables', 'Fruit',
];

const byId = new Map(FOODS.map((f) => [f.id, f]));
export const getFood = (id: string) => byId.get(id);

type DietPrefs = Pick<Settings, 'excludedTags' | 'hiddenFoods'>;

/** False if the food is hidden, or carries a tag the person removed from their diet. */
export function isAllowed(food: Food, prefs: DietPrefs): boolean {
  const excluded = prefs.excludedTags ?? [];
  if (prefs.hiddenFoods?.includes(food.id)) return false;
  return !food.tags.some((t) => excluded.includes(t));
}

export function allowedFoods(prefs: DietPrefs): Food[] {
  return FOODS.filter((f) => isAllowed(f, prefs));
}

export function newItemId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function itemTotals(items: PlanItem[]) {
  let protein = 0;
  let calories = 0;
  for (const item of items) {
    const f = getFood(item.foodId);
    if (!f) continue;
    protein += f.protein * item.servings;
    calories += f.calories * item.servings;
  }
  return { protein: Math.round(protein), calories: Math.round(calories) };
}

export function planItems(plan: DietPlan): PlanItem[] {
  return plan.meals.flatMap((m) => m.items);
}

/** Protein target: 1 g per lb of body weight, a common target for training hard. */
export function proteinGoalFor(weightLbs: number): number {
  return Math.round(weightLbs / 5) * 5;
}

// Each slot lists foods in order of preference; the plan uses the first one the person can eat.
type Slot = { pick: string[]; servings?: number };
const TEMPLATE: { id: MealId; name: string; slots: Slot[] }[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    slots: [
      { pick: ['eggs', 'tofu', 'greek-yogurt', 'cottage-cheese'] },
      { pick: ['egg-whites', 'greek-yogurt', 'cottage-cheese', 'whey', 'plant-protein'] },
      { pick: ['oats', 'wheat-bread', 'rice-cakes'] },
      { pick: ['blueberries', 'strawberries', 'banana'] },
    ],
  },
  {
    id: 'lunch',
    name: 'Lunch',
    slots: [
      { pick: ['chicken-breast', 'ground-turkey', 'tuna-can', 'tofu', 'seitan', 'tempeh', 'lentils'], servings: 1.5 },
      { pick: ['white-rice', 'quinoa', 'brown-rice'] },
      { pick: ['broccoli', 'asparagus', 'pineapple'] },
    ],
  },
  {
    id: 'snack',
    name: 'Snack',
    slots: [
      { pick: ['greek-yogurt', 'cottage-cheese', 'edamame', 'hemp-hearts'] },
      { pick: ['strawberries', 'apple'] },
      { pick: ['whey', 'protein-drink', 'plant-protein'] },
    ],
  },
  {
    id: 'dinner',
    name: 'Dinner',
    slots: [
      { pick: ['salmon', 'sirloin', 'chicken-thigh', 'shrimp', 'cod', 'tempeh', 'seitan', 'lentils'], servings: 1.5 },
      { pick: ['sweet-potato', 'brown-rice', 'white-rice', 'quinoa'] },
      { pick: ['spinach', 'green-beans', 'banana'] },
    ],
  },
];

/** A ~200 g protein starter day built only from foods the person can eat. */
export function recommendedPlan(prefs: DietPrefs = {}): DietPlan {
  const used = new Set<string>();
  return {
    meals: TEMPLATE.map((meal) => ({
      id: meal.id,
      name: meal.name,
      items: meal.slots.flatMap((slot) => {
        const options = slot.pick.filter((id) => isAllowed(getFood(id)!, prefs));
        const foodId = options.find((id) => !used.has(id)) ?? options[0];
        if (!foodId) return [];
        used.add(foodId);
        return [{ id: newItemId(), foodId, servings: slot.servings ?? 1 }];
      }),
    })),
  };
}

export function emptyPlan(): DietPlan {
  return { meals: TEMPLATE.map((m) => ({ id: m.id, name: m.name, items: [] })) };
}
