import { Recipe, Settings, WeeklyMenu, DayPlan } from "./types";
import { weekDates, weekdayOf } from "./dateUtils";

interface GenerateOptions {
  weekStart: string;
  recipes: Recipe[];
  settings: Settings;
  recentRecipeIds: string[];
}

function seasonMatches(recipeSeason: string, activeSeason: string) {
  return recipeSeason === "todo_el_anio" || recipeSeason === activeSeason;
}

function mealTypeMatches(recipeMealType: string, slot: "almuerzo" | "cena") {
  return recipeMealType === "ambos" || recipeMealType === slot;
}

export function generateWeeklyMenu({
  weekStart,
  recipes,
  settings,
  recentRecipeIds,
}: GenerateOptions): WeeklyMenu {
  const dates = weekDates(weekStart);
  const usedThisWeek = new Set<string>();
  const previousProteinType: Record<"almuerzo" | "cena", string | null> = {
    almuerzo: null,
    cena: null,
  };

  const days: DayPlan[] = dates.map((date) => {
    const weekday = weekdayOf(date);
    const isGymDay = settings.gymDays.includes(weekday);

    const pickForSlot = (slot: "almuerzo" | "cena"): string | null => {
      const pool = recipes.filter(
        (r) => seasonMatches(r.season, settings.season) && mealTypeMatches(r.mealType, slot)
      );
      if (pool.length === 0) return null;

      let candidates = pool.filter((r) => !usedThisWeek.has(r.id));
      if (candidates.length === 0) candidates = pool;

      const prevProtein = previousProteinType[slot];
      const varied = candidates.filter((r) => r.proteinType !== prevProtein);
      if (varied.length > 0) candidates = varied;

      if (isGymDay) {
        const highProteinOnes = candidates.filter((r) => r.highProtein);
        if (highProteinOnes.length > 0) candidates = highProteinOnes;
      }

      const notRecent = candidates.filter((r) => !recentRecipeIds.includes(r.id));
      const finalPool = notRecent.length > 0 ? notRecent : candidates;

      const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
      usedThisWeek.add(chosen.id);
      previousProteinType[slot] = chosen.proteinType;
      return chosen.id;
    };

    return {
      date,
      weekday,
      isGymDay,
      almuerzoId: pickForSlot("almuerzo"),
      cenaId: pickForSlot("cena"),
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

export function regenerateDay(
  menu: WeeklyMenu,
  dayIndex: number,
  recipes: Recipe[],
  settings: Settings,
  recentRecipeIds: string[]
): WeeklyMenu {
  const day = menu.days[dayIndex];
  const usedOtherDays = new Set(
    menu.days.flatMap((d, i) => (i === dayIndex ? [] : [d.almuerzoId, d.cenaId]))
      .filter((id): id is string => id !== null)
  );

  const pickForSlot = (slot: "almuerzo" | "cena", currentId: string | null): string | null => {
    const pool = recipes.filter(
      (r) => seasonMatches(r.season, settings.season) && mealTypeMatches(r.mealType, slot)
    );
    if (pool.length === 0) return null;

    let candidates = pool.filter((r) => !usedOtherDays.has(r.id) && r.id !== currentId);
    if (candidates.length === 0) candidates = pool.filter((r) => r.id !== currentId);
    if (candidates.length === 0) candidates = pool;

    if (day.isGymDay) {
      const highProteinOnes = candidates.filter((r) => r.highProtein);
      if (highProteinOnes.length > 0) candidates = highProteinOnes;
    }

    const notRecent = candidates.filter((r) => !recentRecipeIds.includes(r.id));
    const finalPool = notRecent.length > 0 ? notRecent : candidates;

    return finalPool[Math.floor(Math.random() * finalPool.length)].id;
  };

  const newDay: DayPlan = {
    ...day,
    almuerzoId: pickForSlot("almuerzo", day.almuerzoId),
    cenaId: pickForSlot("cena", day.cenaId),
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
