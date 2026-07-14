import { Recipe, WeeklyMenu, ShoppingListItem, ShoppingList } from "./types";

interface ParsedQuantity {
  value: number;
  unit: string;
}

const UNIT_ALIASES: Record<string, string> = {
  unidades: "unidad",
  u: "unidad",
  dientes: "diente",
  latas: "lata",
  rebanadas: "rebanada",
  fetas: "feta",
  ramas: "rama",
  discos: "disco",
  atados: "atado",
  potes: "pote",
  frascos: "frasco",
  bolsas: "bolsa",
  botellas: "botella",
  grs: "g",
  gr: "g",
};

function normalizeUnit(unit: string): string {
  return UNIT_ALIASES[unit] ?? unit;
}

function parseQuantity(quantity: string): ParsedQuantity | null {
  const match = quantity.trim().match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(.*)$/);
  if (!match) return null;

  const [, numberPart, unitPart] = match;
  let value: number;
  if (numberPart.includes("/")) {
    const [numerator, denominator] = numberPart.split("/").map(Number);
    value = numerator / denominator;
  } else {
    value = parseFloat(numberPart.replace(",", "."));
  }
  if (Number.isNaN(value)) return null;

  return { value, unit: normalizeUnit(unitPart.trim().toLowerCase()) };
}

function formatQuantity(value: number, unit: string): string {
  const rounded = Math.round(value * 100) / 100;
  return unit ? `${rounded} ${unit}` : `${rounded}`;
}

type ShoppingCategory = "verdura" | "carne" | "otro";

const CATEGORY_RANK: Record<ShoppingCategory, number> = {
  verdura: 0,
  carne: 1,
  otro: 2,
};

const VEGGIE_KEYWORDS = [
  "cebolla", "tomate", "papa", "batata", "zanahoria", "lechuga", "acelga",
  "zapallo", "zapallito", "brocoli", "morron", "apio", "choclo", "ajo",
  "calabaza", "espinaca", "rucula", "repollo", "pepino", "berenjena",
  "remolacha", "puerro", "perejil", "cilantro", "limon", "naranja",
  "manzana", "banana", "durazno", "pera", "palta", "hongo", "champinon",
  "kale", "radicheta", "verdura", "ensalada mixta",
];

const MEAT_KEYWORDS = [
  "carne", "milanesa", "pollo", "pechuga", "cerdo", "costeleta", "bondiola",
  "chorizo", "panceta", "jamon", "bife", "pescado", "merluza", "salmon",
  "atun", "filete", "higado", "rinon", "nugget", "matambre", "asado",
  "peceto", "osobuco", "pavita", "cordero",
];

function normalizeForMatch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function classifyIngredient(name: string): ShoppingCategory {
  const normalized = normalizeForMatch(name);
  if (MEAT_KEYWORDS.some((k) => normalized.includes(k))) return "carne";
  if (VEGGIE_KEYWORDS.some((k) => normalized.includes(k))) return "verdura";
  return "otro";
}

/**
 * Ordena la lista: verduras primero, después carnes, después el resto.
 * Dentro de cada grupo, alfabético.
 */
export function sortShoppingItems(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((a, b) => {
    const rankDiff = CATEGORY_RANK[classifyIngredient(a.name)] - CATEGORY_RANK[classifyIngredient(b.name)];
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name, "es");
  });
}

export interface ShoppingGroup {
  name: string;
  items: ShoppingListItem[];
}

const CATEGORY_GROUP_LABELS: Record<ShoppingCategory, string> = {
  verdura: "Verduras",
  carne: "Carnes",
  otro: "Resto",
};

/**
 * Agrupa la lista (ya ordenada) en Verduras / Carnes / Resto, y por último
 * "Agregados a mano" para los productos sueltos que no vienen de ninguna
 * receta. Solo incluye grupos con al menos un ítem.
 */
export function groupShoppingItems(items: ShoppingListItem[]): ShoppingGroup[] {
  const manual = items.filter((i) => i.fromRecipes.length === 0);
  const fromRecipes = items.filter((i) => i.fromRecipes.length > 0);

  const groups: ShoppingGroup[] = (Object.keys(CATEGORY_GROUP_LABELS) as ShoppingCategory[])
    .map((cat) => ({
      name: CATEGORY_GROUP_LABELS[cat],
      items: fromRecipes.filter((i) => classifyIngredient(i.name) === cat),
    }))
    .filter((g) => g.items.length > 0);

  if (manual.length > 0) {
    groups.push({ name: "Agregados a mano", items: manual });
  }

  return groups;
}

interface Accumulator {
  name: string;
  haveIt: boolean;
  fromRecipes: string[];
  totalsByUnit: Map<string, number>;
  unparsed: string[];
}

export function buildShoppingList(
  menu: WeeklyMenu,
  recipes: Recipe[],
  previous?: ShoppingList | null
): ShoppingList {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const accumulators = new Map<string, Accumulator>();

  const addIngredientsFrom = (recipeId: string | null) => {
    if (!recipeId) return;
    const recipe = recipeMap.get(recipeId);
    if (!recipe) return;

    for (const ing of recipe.ingredients) {
      const key = ing.name.trim().toLowerCase();
      let acc = accumulators.get(key);
      if (!acc) {
        const previousItem = previous?.items.find(
          (i) => i.name.trim().toLowerCase() === key
        );
        acc = {
          name: ing.name.trim(),
          haveIt: previousItem?.haveIt ?? false,
          fromRecipes: [],
          totalsByUnit: new Map(),
          unparsed: [],
        };
        accumulators.set(key, acc);
      }

      if (!acc.fromRecipes.includes(recipe.name)) {
        acc.fromRecipes.push(recipe.name);
      }

      if (ing.quantity) {
        const parsed = parseQuantity(ing.quantity);
        if (parsed) {
          acc.totalsByUnit.set(parsed.unit, (acc.totalsByUnit.get(parsed.unit) ?? 0) + parsed.value);
        } else if (!acc.unparsed.includes(ing.quantity)) {
          acc.unparsed.push(ing.quantity);
        }
      }
    }
  };

  for (const day of menu.days) {
    addIngredientsFrom(day.almuerzoId);
    addIngredientsFrom(day.cenaId);
  }

  const items: ShoppingListItem[] = Array.from(accumulators.values()).map((acc) => ({
    name: acc.name,
    haveIt: acc.haveIt,
    fromRecipes: acc.fromRecipes,
    quantities: [
      ...Array.from(acc.totalsByUnit.entries()).map(([unit, total]) => formatQuantity(total, unit)),
      ...acc.unparsed,
    ],
  }));

  // Los productos agregados a mano en la lista anterior (no vienen de
  // ninguna receta de esta semana) se mantienen tal cual.
  const manualItems = (previous?.items ?? []).filter(
    (i) => i.fromRecipes.length === 0 && !items.some((it) => it.name.trim().toLowerCase() === i.name.trim().toLowerCase())
  );

  return { weekId: menu.id, items: sortShoppingItems([...items, ...manualItems]) };
}
