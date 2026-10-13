export type TaskId = 'wake' | 'workout' | 'outdoor' | 'water' | 'photo' | 'custom' | 'diet';

export type FoodCategory =
  | 'Meat & Poultry'
  | 'Seafood'
  | 'Eggs & Dairy'
  | 'Plant Protein'
  | 'Shakes & Snacks'
  | 'Nuts & Seeds'
  | 'Grains'
  | 'Vegetables'
  | 'Fruit';

export type FoodTag =
  | 'tree-nuts'
  | 'peanuts'
  | 'legumes'
  | 'soy'
  | 'dairy'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'gluten'
  | 'meat'
  | 'red-meat'
  | 'pork'
  | 'vegetables';

export type Food = {
  id: string;
  name: string;
  serving: string;
  protein: number; // grams per serving
  calories: number; // per serving
  category: FoodCategory;
  tags: FoodTag[]; // used by diet restrictions
  note?: string;
};

export type PlanItem = { id: string; foodId: string; servings: number };

export type MealId = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type Meal = { id: MealId; name: string; items: PlanItem[] };

export type DietPlan = { meals: Meal[] };

export type DayLog = {
  date: string; // YYYY-MM-DD (local)
  checks: Partial<Record<'workout' | 'outdoor' | 'custom' | 'diet', boolean>>;
  wakeCheckIn?: string; // ISO timestamp
  wakeOnTime?: boolean;
  wakeWaived?: boolean; // first day started after the wake-up deadline
  waterOz: number;
  photo?: string; // file name inside the progress photo folder (or a full uri on web)
  eatenPlanItems: string[]; // PlanItem ids eaten today
  extraFoods: PlanItem[]; // foods eaten that weren't in the plan
};

export type Settings = {
  customTaskName: string;
  customTaskMinutes: number;
  bodyWeightLbs: number | null;
  proteinGoal: number; // grams per day
  remindersEnabled: boolean;
  excludedTags?: FoodTag[]; // restrictions the person removed from their diet
  hiddenFoods?: string[]; // individual foods the person removed
  calendarPromptDismissed?: boolean; // web: hid the "add reminders to Google Calendar" card
};

export type HistoryEntry = {
  date: string;
  dayNumber: number; // the challenge day this date was attempted as
  result: 'done' | 'missed';
  nextDay: number; // the challenge day after this date was settled
};

export type Progress = {
  startDate: string | null;
  completed: number; // days credited toward 75
  streak: number; // perfect days in a row
  bestStreak: number;
  lastSettled: string | null; // last date that has been scored
  finishedOn: string | null;
  history: HistoryEntry[];
};

export type AppState = {
  version: 1;
  settings: Settings;
  progress: Progress;
  plan: DietPlan;
  logs: Record<string, DayLog>;
};
