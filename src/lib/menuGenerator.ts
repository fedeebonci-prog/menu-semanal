import { Recipe, RecipeCategory, Settings, WeeklyMenu, DayPlan } from "./types";
import { weekDates, weekdayOf } from "./dateUtils";

type Slot = "almuerzo" | "cena";

interface GenerateOptions {
  weekStart: string;
  recipes: Recipe[];
  settings: Settings;
  recentRecipeIds: string[];
}

function seasonMatches(recipeSeason: string, activeSeason: string) {
  return recipeSeason === "todo_el_anio" || recipeSeason === activeSeason;
}

function mealTypeMatches(recipeMealType: string, slot: Slot) {
  return recipeMealType === "ambos" || recipeMealType === slot;
}

/**
 * Qué comidas cubre el predictor automático: de almuerzo del lunes a
 * almuerzo del viernes. Viernes a la noche, sábado y domingo quedan afuera
 * (se planifican a mano si hace falta).
 */
export function isPlannedSlot(weekday: number, slot: Slot): boolean {
  if (weekday === 0 || weekday === 6) return false; // domingo, sábado
  if (weekday === 5 && slot === "cena") return false; // viernes a la noche
  return true;
}

/**
 * Narrows candidates by a nutritional preference, but only if that leaves at
 * least one option — otherwise keeps the wider set. Días de gimnasio piden
 * hidratos al mediodía y proteína a la noche; días de descanso piden platos
 * livianos en cualquier comida.
 */
function applyNutritionPreference(candidates: Recipe[], slot: Slot, isGymDay: boolean): Recipe[] {
  if (isGymDay) {
    const preferred = candidates.filter((r) => (slot === "almuerzo" ? r.highCarb : r.highProtein));
    return preferred.length > 0 ? preferred : candidates;
  }
  const light = candidates.filter((r) => r.light);
  return light.length > 0 ? light : candidates;
}

interface PickArgs {
  recipes: Recipe[];
  season: string;
  slot: Slot;
  isGymDay: boolean;
  usedRecipeIds: Set<string>;
  usedCategories: Set<RecipeCategory>;
  excludeCategory: RecipeCategory | null;
  prevProteinType: string | null;
  recentRecipeIds: string[];
  excludeCurrentId?: string | null;
}

/**
 * Elige una receta para un slot aplicando, en orden de prioridad, cada
 * preferencia solo si deja al menos una opción — así nunca se vacía el
 * pool por acumular demasiadas restricciones a la vez:
 * 1) no repetir receta esta semana (se relaja solo si el pool se agotó)
 * 2) no repetir la categoría del otro plato del mismo día
 * 3) hidratos/proteína/liviana según día de gimnasio o descanso
 * 4) no repetir categoría ya usada esta semana
 * 5) variar la proteína respecto al mismo slot del día anterior
 * 6) evitar recetas usadas en semanas recientes
 */
function pickRecipe(args: PickArgs): Recipe | null {
  const pool = args.recipes.filter(
    (r) => seasonMatches(r.season, args.season) && mealTypeMatches(r.mealType, args.slot)
  );
  if (pool.length === 0) return null;

  let candidates = pool.filter(
    (r) => !args.usedRecipeIds.has(r.id) && r.id !== args.excludeCurrentId
  );
  if (candidates.length === 0) {
    candidates = pool.filter((r) => r.id !== args.excludeCurrentId);
    if (candidates.length === 0) candidates = pool;
  }

  if (args.excludeCategory) {
    const differentCategory = candidates.filter((r) => r.category !== args.excludeCategory);
    if (differentCategory.length > 0) candidates = differentCategory;
  }

  candidates = applyNutritionPreference(candidates, args.slot, args.isGymDay);

  const newCategory = candidates.filter((r) => !args.usedCategories.has(r.category));
  if (newCategory.length > 0) candidates = newCategory;

  const varied = candidates.filter((r) => r.proteinType !== args.prevProteinType);
  if (varied.length > 0) candidates = varied;

  const notRecent = candidates.filter((r) => !args.recentRecipeIds.includes(r.id));
  const finalPool = notRecent.length > 0 ? notRecent : candidates;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function generateWeeklyMenu({
  weekStart,
  recipes,
  settings,
  recentRecipeIds,
}: GenerateOptions): WeeklyMenu {
  const dates = weekDates(weekStart);
  const usedRecipeIds = new Set<string>();
  const usedCategories = new Set<RecipeCategory>();
  const previousProteinType: Record<Slot, string | null> = {
    almuerzo: null,
    cena: null,
  };

  const days: DayPlan[] = dates.map((date) => {
    const weekday = weekdayOf(date);
    const isGymDay = settings.gymDays.includes(weekday);

    let almuerzoRecipe: Recipe | null = null;
    let cenaRecipe: Recipe | null = null;

    if (isPlannedSlot(weekday, "almuerzo")) {
      almuerzoRecipe = pickRecipe({
        recipes,
        season: settings.season,
        slot: "almuerzo",
        isGymDay,
        usedRecipeIds,
        usedCategories,
        excludeCategory: null,
        prevProteinType: previousProteinType.almuerzo,
        recentRecipeIds,
      });
      if (almuerzoRecipe) {
        usedRecipeIds.add(almuerzoRecipe.id);
        usedCategories.add(almuerzoRecipe.category);
        previousProteinType.almuerzo = almuerzoRecipe.proteinType;
      }
    }

    if (isPlannedSlot(weekday, "cena")) {
      cenaRecipe = pickRecipe({
        recipes,
        season: settings.season,
        slot: "cena",
        isGymDay,
        usedRecipeIds,
        usedCategories,
        excludeCategory: almuerzoRecipe?.category ?? null,
        prevProteinType: previousProteinType.cena,
        recentRecipeIds,
      });
      if (cenaRecipe) {
        usedRecipeIds.add(cenaRecipe.id);
        usedCategories.add(cenaRecipe.category);
        previousProteinType.cena = cenaRecipe.proteinType;
      }
    }

    return {
      date,
      weekday,
      isGymDay,
      almuerzoId: almuerzoRecipe?.id ?? null,
      cenaId: cenaRecipe?.id ?? null,
    };
  });

  return {
    id: weekStart,
    weekStart,
    season: settings.season,
    days,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Vuelve a sortear una sola comida puntual (mismo día, misma franja), sin
 * tocar el resto de la semana. Sigue evitando repetir receta/categoría con
 * el resto del menú y con la otra comida del mismo día.
 */
export function regenerateMeal(
  menu: WeeklyMenu,
  dayIndex: number,
  slot: Slot,
  recipes: Recipe[],
  settings: Settings,
  recentRecipeIds: string[]
): WeeklyMenu {
  const day = menu.days[dayIndex];
  if (!isPlannedSlot(day.weekday, slot)) return menu;

  const currentId = slot === "almuerzo" ? day.almuerzoId : day.cenaId;
  const otherId = slot === "almuerzo" ? day.cenaId : day.almuerzoId;

  const usedElsewhere = new Set(
    menu.days
      .flatMap((d, i) => (i === dayIndex ? (otherId ? [otherId] : []) : [d.almuerzoId, d.cenaId]))
      .filter((id): id is string => id !== null)
  );

  const usedCategoriesElsewhere = new Set<RecipeCategory>();
  menu.days.forEach((d, i) => {
    for (const id of [d.almuerzoId, d.cenaId]) {
      if (i === dayIndex && id === currentId) continue;
      const recipe = id ? recipes.find((r) => r.id === id) : null;
      if (recipe) usedCategoriesElsewhere.add(recipe.category);
    }
  });

  const otherRecipe = otherId ? recipes.find((r) => r.id === otherId) ?? null : null;

  const chosen = pickRecipe({
    recipes,
    season: settings.season,
    slot,
    isGymDay: day.isGymDay,
    usedRecipeIds: usedElsewhere,
    usedCategories: usedCategoriesElsewhere,
    excludeCategory: otherRecipe?.category ?? null,
    prevProteinType: null,
    recentRecipeIds,
    excludeCurrentId: currentId,
  });

  const newDay: DayPlan = {
    ...day,
    almuerzoId: slot === "almuerzo" ? chosen?.id ?? null : day.almuerzoId,
    cenaId: slot === "cena" ? chosen?.id ?? null : day.cenaId,
  };

  return {
    ...menu,
    days: menu.days.map((d, i) => (i === dayIndex ? newDay : d)),
  };
}

export function recentRecipeIdsFromMenus(
  menus: Record<string, WeeklyMenu>,
  excludeWeekId: string,
  weeksBack = 2
): string[] {
  const weekIds = Object.keys(menus)
    .filter((id) => id !== excludeWeekId)
    .sort()
    .reverse()
    .slice(0, weeksBack);

  const ids = new Set<string>();
  for (const weekId of weekIds) {
    for (const day of menus[weekId].days) {
      if (day.almuerzoId) ids.add(day.almuerzoId);
      if (day.cenaId) ids.add(day.cenaId);
    }
  }
  return Array.from(ids);
}
