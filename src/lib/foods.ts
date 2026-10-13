import type { DietPlan, Food, FoodCategory, PlanItem } from './types';

/**
 * High-protein foods that fit the plan's rules:
 *  - no nuts of any kind (incl. peanuts, nut butters, nut milks, coconut)
 *  - no chickpeas, and no other legumes (lentils, peas, beans, soy) because
 *    they commonly cross-react with a chickpea allergy
 *  - no vegetables (fruit instead)
 * Values are approximate (USDA averages, cooked weights). Brands vary.
 */
export const FOODS: Food[] = [
  // Meat & Poultry
  { id: 'chicken-breast', name: 'Chicken breast', serving: '4 oz cooked', protein: 35, calories: 185, category: 'Meat & Poultry' },
  { id: 'chicken-thigh', name: 'Chicken thigh, skinless', serving: '4 oz cooked', protein: 29, calories: 235, category: 'Meat & Poultry' },
  { id: 'ground-turkey', name: 'Ground turkey, 93% lean', serving: '4 oz cooked', protein: 30, calories: 240, category: 'Meat & Poultry' },
  { id: 'ground-beef', name: 'Ground beef, 93% lean', serving: '4 oz cooked', protein: 30, calories: 220, category: 'Meat & Poultry' },
  { id: 'sirloin', name: 'Sirloin steak', serving: '4 oz cooked', protein: 33, calories: 210, category: 'Meat & Poultry' },
  { id: 'bison', name: 'Ground bison', serving: '4 oz cooked', protein: 32, calories: 200, category: 'Meat & Poultry' },
  { id: 'pork-tenderloin', name: 'Pork tenderloin', serving: '4 oz cooked', protein: 30, calories: 165, category: 'Meat & Poultry' },
  { id: 'deli-turkey', name: 'Deli turkey breast', serving: '3 oz', protein: 15, calories: 90, category: 'Meat & Poultry' },
  { id: 'rotisserie-chicken', name: 'Rotisserie chicken, white meat', serving: '4 oz', protein: 32, calories: 190, category: 'Meat & Poultry' },
  // Seafood
  { id: 'salmon', name: 'Salmon', serving: '4 oz cooked', protein: 28, calories: 235, category: 'Seafood' },
  { id: 'tuna-can', name: 'Tuna, canned in water', serving: '1 can, drained', protein: 27, calories: 120, category: 'Seafood' },
  { id: 'shrimp', name: 'Shrimp', serving: '4 oz cooked', protein: 27, calories: 115, category: 'Seafood' },
  { id: 'cod', name: 'Cod', serving: '4 oz cooked', protein: 26, calories: 120, category: 'Seafood' },
  { id: 'tilapia', name: 'Tilapia', serving: '4 oz cooked', protein: 29, calories: 145, category: 'Seafood' },
  // Eggs & Dairy
  { id: 'eggs', name: 'Whole eggs', serving: '3 large', protein: 19, calories: 215, category: 'Eggs & Dairy' },
  { id: 'egg-whites', name: 'Liquid egg whites', serving: '1 cup', protein: 26, calories: 125, category: 'Eggs & Dairy' },
  { id: 'greek-yogurt', name: 'Greek yogurt, nonfat plain', serving: '1 cup', protein: 23, calories: 130, category: 'Eggs & Dairy' },
  { id: 'cottage-cheese', name: 'Cottage cheese, low-fat', serving: '1 cup', protein: 28, calories: 180, category: 'Eggs & Dairy' },
  { id: 'ultra-milk', name: 'Ultra-filtered milk (e.g. Fairlife)', serving: '1 cup', protein: 13, calories: 80, category: 'Eggs & Dairy' },
  { id: 'milk', name: 'Milk, 1%', serving: '1 cup', protein: 8, calories: 100, category: 'Eggs & Dairy' },
  { id: 'string-cheese', name: 'String cheese', serving: '1 stick', protein: 7, calories: 80, category: 'Eggs & Dairy' },
  // Shakes & Snacks
  {
    id: 'whey', name: 'Whey protein shake', serving: '1 scoop', protein: 25, calories: 120, category: 'Shakes & Snacks',
    note: 'Pick a brand labeled nut-free. Many are made on lines shared with nuts.',
  },
  {
    id: 'protein-drink', name: 'Ready-to-drink protein shake', serving: '1 bottle', protein: 30, calories: 160, category: 'Shakes & Snacks',
    note: 'Check the label for "may contain tree nuts/peanuts".',
  },
  {
    id: 'jerky', name: 'Beef jerky', serving: '1 oz', protein: 10, calories: 80, category: 'Shakes & Snacks',
    note: 'Some flavors (teriyaki/Thai) contain peanuts. Check the label.',
  },
  // Grains
  { id: 'white-rice', name: 'White rice', serving: '1 cup cooked', protein: 4, calories: 205, category: 'Grains' },
  { id: 'brown-rice', name: 'Brown rice', serving: '1 cup cooked', protein: 5, calories: 215, category: 'Grains' },
  { id: 'oats', name: 'Oats', serving: '½ cup dry', protein: 5, calories: 150, category: 'Grains', note: 'Plain oats only. Granola often contains nuts.' },
  { id: 'quinoa', name: 'Quinoa', serving: '1 cup cooked', protein: 8, calories: 220, category: 'Grains' },
  { id: 'pasta', name: 'Pasta (wheat)', serving: '1 cup cooked', protein: 8, calories: 200, category: 'Grains', note: 'Avoid chickpea or lentil pasta.' },
  { id: 'wheat-bread', name: 'Whole wheat bread', serving: '2 slices', protein: 8, calories: 160, category: 'Grains' },
  { id: 'bagel', name: 'Plain bagel', serving: '1 bagel', protein: 10, calories: 270, category: 'Grains' },
  { id: 'tortilla', name: 'Flour tortilla, large', serving: '1 tortilla', protein: 5, calories: 140, category: 'Grains' },
  { id: 'rice-cakes', name: 'Rice cakes', serving: '2 cakes', protein: 2, calories: 70, category: 'Grains' },
  // Fruit
  { id: 'banana', name: 'Banana', serving: '1 medium', protein: 1, calories: 105, category: 'Fruit' },
  { id: 'blueberries', name: 'Blueberries', serving: '1 cup', protein: 1, calories: 85, category: 'Fruit' },
  { id: 'strawberries', name: 'Strawberries', serving: '1 cup', protein: 1, calories: 50, category: 'Fruit' },
  { id: 'apple', name: 'Apple', serving: '1 medium', protein: 0.5, calories: 95, category: 'Fruit' },
  { id: 'orange', name: 'Orange', serving: '1 medium', protein: 1, calories: 60, category: 'Fruit' },
  { id: 'pineapple', name: 'Pineapple', serving: '1 cup', protein: 1, calories: 80, category: 'Fruit' },
  { id: 'mango', name: 'Mango', serving: '1 cup', protein: 1.5, calories: 100, category: 'Fruit' },
  { id: 'grapes', name: 'Grapes', serving: '1 cup', protein: 1, calories: 105, category: 'Fruit' },
];

export const CATEGORIES: FoodCategory[] = ['Meat & Poultry', 'Seafood', 'Eggs & Dairy', 'Shakes & Snacks', 'Grains', 'Fruit'];

const byId = new Map(FOODS.map((f) => [f.id, f]));
export const getFood = (id: string) => byId.get(id);

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

const item = (foodId: string, servings = 1): PlanItem => ({ id: newItemId(), foodId, servings });

/** A starter day at roughly 200 g protein. Scale servings to your goal. */
export function recommendedPlan(): DietPlan {
  return {
    meals: [
      { id: 'breakfast', name: 'Breakfast', items: [item('eggs'), item('egg-whites'), item('oats'), item('blueberries')] },
      { id: 'lunch', name: 'Lunch', items: [item('chicken-breast', 1.5), item('white-rice'), item('pineapple')] },
      { id: 'snack', name: 'Snack', items: [item('greek-yogurt'), item('strawberries'), item('whey')] },
      { id: 'dinner', name: 'Dinner', items: [item('salmon', 1.5), item('brown-rice'), item('banana')] },
    ],
  };
}

export function emptyPlan(): DietPlan {
  return {
    meals: [
      { id: 'breakfast', name: 'Breakfast', items: [] },
      { id: 'lunch', name: 'Lunch', items: [] },
      { id: 'snack', name: 'Snack', items: [] },
      { id: 'dinner', name: 'Dinner', items: [] },
    ],
  };
}
