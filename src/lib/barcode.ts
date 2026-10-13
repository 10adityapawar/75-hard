// Looks up packaged foods by barcode in Open Food Facts (free, no account needed).
import type { Food, FoodTag } from './types';

const API = 'https://world.openfoodfacts.org/api/v2/product/';
const FIELDS = 'code,product_name,brands,serving_size,nutriments,nutrition_data_per,allergens_tags,traces_tags';

// Open Food Facts allergen tags -> our diet restriction tags.
const ALLERGENS: Record<string, FoodTag[]> = {
  'en:milk': ['dairy'],
  'en:eggs': ['eggs'],
  'en:peanuts': ['peanuts', 'legumes'],
  'en:nuts': ['tree-nuts'],
  'en:soybeans': ['soy', 'legumes'],
  'en:lupin': ['legumes'],
  'en:gluten': ['gluten'],
  'en:fish': ['fish'],
  'en:crustaceans': ['shellfish'],
  'en:molluscs': ['shellfish'],
};

/** Pulls a product barcode out of whatever the camera read (plain digits, or a QR code holding a product link). */
export function extractBarcode(raw: string): string | null {
  const text = raw.trim();
  if (/^\d{8,14}$/.test(text)) return text;
  const inUrl = text.match(/(?:product|gtin|01)\/(\d{8,14})\b/i) ?? text.match(/\b(\d{12,14})\b/);
  return inUrl ? inUrl[1] : null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export type LookupResult = { food: Food; mayContain: FoodTag[] } | { error: string };

export async function lookupBarcode(code: string): Promise<LookupResult> {
  let json: any;
  try {
    const res = await fetch(`${API}${encodeURIComponent(code)}.json?fields=${FIELDS}`);
    json = await res.json();
  } catch {
    return { error: "Couldn't reach the food database. Check your internet connection and try again." };
  }
  const p = json?.product;
  if (json?.status !== 1 || !p) return { error: `No product found for barcode ${code}. It may not be in the database yet.` };

  const n = p.nutriments ?? {};
  // Prefer per-serving numbers; fall back to per 100 g / 100 ml.
  const perServing = n['energy-kcal_serving'] != null || n.proteins_serving != null;
  const get = (key: string): number | undefined => {
    const v = n[`${key}_${perServing ? 'serving' : '100g'}`];
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  };
  const kcal = get('energy-kcal') ?? (get('energy-kj') !== undefined ? get('energy-kj')! / 4.184 : undefined);
  if (kcal === undefined && get('proteins') === undefined) {
    return { error: `Found "${p.product_name || code}", but it has no nutrition info in the database.` };
  }

  const tagsFrom = (list: unknown) => [...new Set((Array.isArray(list) ? list : []).flatMap((t: string) => ALLERGENS[t] ?? []))];
  const tags = tagsFrom(p.allergens_tags);
  const mayContain = tagsFrom(p.traces_tags).filter((t) => !tags.includes(t));
  const sodium = get('sodium');

  const food: Food = {
    id: `off-${p.code || code}`,
    name: (p.product_name || 'Unnamed product').trim(),
    brand: typeof p.brands === 'string' ? p.brands.split(',')[0].trim() || undefined : undefined,
    barcode: p.code || code,
    serving: perServing ? p.serving_size || '1 serving' : p.nutrition_data_per === '100ml' ? '100 ml' : '100 g',
    calories: Math.round(kcal ?? 0),
    protein: round1(get('proteins') ?? 0),
    carbs: round1(get('carbohydrates') ?? 0),
    fat: round1(get('fat') ?? 0),
    sugar: get('sugars') !== undefined ? round1(get('sugars')!) : undefined,
    fiber: get('fiber') !== undefined ? round1(get('fiber')!) : undefined,
    sodium: sodium !== undefined ? Math.round(sodium * 1000) : undefined,
    category: 'My Foods',
    tags,
    note: mayContain.length ? `May contain: ${mayContain.join(', ')}` : undefined,
  };
  return { food, mayContain };
}
