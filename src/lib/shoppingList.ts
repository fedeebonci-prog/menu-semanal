import { Recipe, WeeklyMenu, ShoppingListItem, ShoppingList } from "./types";
import { newId } from "./store";

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
  fromRecipes: string[];
  totalsByUnit: Map<string, number>;
  unparsed: string[];
}

/**
 * Reconstruye la lista de compras a partir del menú de la semana. Mantiene
 * el id, el tilde y el orden manual de los productos que ya estaban en la
 * lista anterior (auto o agregados a mano); los que ya no corresponden a
 * ninguna receta de esta semana se quitan, y los nuevos se agregan al final.
 */
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
        acc = { name: ing.name.trim(), fromRecipes: [], totalsByUnit: new Map(), unparsed: [] };
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

  const previousByKey = new Map((previous?.items ?? []).map((i) => [i.name.trim().toLowerCase(), i]));

  const newAutoByKey = new Map(
    Array.from(accumulators.entries()).map(([key, acc]) => {
      const prev = previousByKey.get(key);
      const item: ShoppingListItem = {
        id: prev?.id ?? newId(),
        name: acc.name,
        quantity: [
          ...Array.from(acc.totalsByUnit.entries()).map(([unit, total]) => formatQuantity(total, unit)),
          ...acc.unparsed,
        ].join(" + "),
        haveIt: prev?.haveIt ?? false,
        fromRecipes: acc.fromRecipes,
      };
      return [key, item] as const;
    })
  );

  // Preserva el orden manual: primero los que ya estaban (actualizados o,
  // si eran agregados a mano, tal cual), después los que aparecen por
  // primera vez esta semana.
  const consumedKeys = new Set<string>();
  const ordered: ShoppingListItem[] = [];
  for (const prevItem of previous?.items ?? []) {
    const key = prevItem.name.trim().toLowerCase();
    const updated = newAutoByKey.get(key);
    if (updated) {
      ordered.push(updated);
      consumedKeys.add(key);
    } else if (prevItem.fromRecipes.length === 0) {
      ordered.push(prevItem);
    }
  }
  for (const [key, item] of newAutoByKey) {
    if (!consumedKeys.has(key)) ordered.push(item);
  }

  return { weekId: menu.id, items: ordered };
}
