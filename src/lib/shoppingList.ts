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

  const items: ShoppingListItem[] = Array.from(accumulators.values())
    .map((acc) => ({
      name: acc.name,
      haveIt: acc.haveIt,
      fromRecipes: acc.fromRecipes,
      quantities: [
        ...Array.from(acc.totalsByUnit.entries()).map(([unit, total]) => formatQuantity(total, unit)),
        ...acc.unparsed,
      ],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return { weekId: menu.id, items };
}
