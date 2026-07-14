"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Recipe, Settings, WeeklyMenu } from "@/lib/types";
import {
  getRecipes,
  getSettings,
  saveSettings,
  getMenu,
  getMenus,
  saveMenu,
  getShoppingList,
  saveShoppingList,
} from "@/lib/store";
import { generateWeeklyMenu, isPlannedSlot, recentRecipeIdsFromMenus, regenerateMeal } from "@/lib/menuGenerator";
import { buildShoppingList } from "@/lib/shoppingList";
import { addDays, defaultWeekStart, formatWeekRange, toISODate, WEEKDAY_LABELS } from "@/lib/dateUtils";
import SettingsPanel from "@/components/SettingsPanel";

type Slot = "almuerzo" | "cena";

const TAG_STYLE: Record<string, { bg: string; text: string }> = {
  "Alta en hidratos": { bg: "var(--tag-carb-bg)", text: "var(--tag-carb-text)" },
  "Alta en proteína": { bg: "var(--tag-protein-bg)", text: "var(--tag-protein-text)" },
  Liviana: { bg: "var(--tag-light-bg)", text: "var(--tag-light-text)" },
};

function tagFor(day: { weekday: number; isGymDay: boolean }, slot: Slot): string | null {
  if (!isPlannedSlot(day.weekday, slot)) return null;
  if (day.isGymDay) return slot === "almuerzo" ? "Alta en hidratos" : "Alta en proteína";
  return "Liviana";
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekId = searchParams.get("week") ?? defaultWeekStart();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [loadedWeekId, setLoadedWeekId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState<{ index: number; slot: Slot } | null>(null);
  const loading = loadedWeekId !== weekId;
  const todayISO = toISODate(new Date());

  useEffect(() => {
    (async () => {
      const [r, s, m] = await Promise.all([getRecipes(), getSettings(), getMenu(weekId)]);
      setRecipes(r);
      setSettings(s);
      setMenu(m);
      setLoadedWeekId(weekId);
    })();
  }, [weekId]);

  function goToWeek(newWeekId: string) {
    router.push(`/?week=${newWeekId}`);
  }

  function recipeById(id: string | null) {
    return id ? recipes.find((r) => r.id === id) ?? null : null;
  }

  async function handleGenerate() {
    if (!settings) return;
    setGenerating(true);
    const allMenus = await getMenus();
    const recentIds = recentRecipeIdsFromMenus(allMenus, weekId, 2);
    const newMenu = generateWeeklyMenu({
      weekStart: weekId,
      recipes,
      settings,
      recentRecipeIds: recentIds,
    });
    await saveMenu(newMenu);

    const previousList = await getShoppingList(weekId);
    const list = buildShoppingList(newMenu, recipes, previousList);
    await saveShoppingList(list);

    setMenu(newMenu);
    setGenerating(false);
  }

  async function handleManualSelect(dayIndex: number, slot: Slot, recipeId: string) {
    if (!menu) return;
    const idOrNull = recipeId === "" ? null : recipeId;
    const updated: WeeklyMenu = {
      ...menu,
      days: menu.days.map((d, i) =>
        i === dayIndex ? { ...d, [slot === "almuerzo" ? "almuerzoId" : "cenaId"]: idOrNull } : d
      ),
    };
    await saveMenu(updated);

    const previousList = await getShoppingList(weekId);
    const list = buildShoppingList(updated, recipes, previousList);
    await saveShoppingList(list);

    setMenu(updated);
  }

  async function handleRegenerateMeal(dayIndex: number, slot: Slot) {
    if (!menu || !settings) return;
    setRegenerating({ index: dayIndex, slot });
    const allMenus = await getMenus();
    const recentIds = recentRecipeIdsFromMenus(allMenus, weekId, 2);
    const updated = regenerateMeal(menu, dayIndex, slot, recipes, settings, recentIds);
    await saveMenu(updated);

    const previousList = await getShoppingList(weekId);
    const list = buildShoppingList(updated, recipes, previousList);
    await saveShoppingList(list);

    setMenu(updated);
    setRegenerating(null);
  }

  async function handleSeasonChange(season: Settings["season"]) {
    if (!settings) return;
    const updated = { ...settings, season };
    setSettings(updated);
    await saveSettings(updated);
  }

  async function handleGymDaysChange(gymDays: number[]) {
    if (!settings) return;
    const updated = { ...settings, gymDays };
    setSettings(updated);
    await saveSettings(updated);
  }

  if (loading || !settings) {
    return <main className="flex flex-1 items-center justify-center text-sm text-muted">Cargando…</main>;
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-border-app px-5 pb-[18px] pt-7">
        <h1 className="font-serif text-[26px] font-semibold tracking-tight text-foreground-brand">
          Menú semanal
        </h1>
        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            onClick={() => goToWeek(addDays(weekId, -7))}
            className="rounded-full border border-border-app px-2 py-0.5 text-sm text-muted"
            aria-label="Semana anterior"
          >
            ←
          </button>
          <span className="text-sm text-muted">{formatWeekRange(weekId)}</span>
          <button
            onClick={() => goToWeek(addDays(weekId, 7))}
            className="rounded-full border border-border-app px-2 py-0.5 text-sm text-muted"
            aria-label="Semana siguiente"
          >
            →
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-bold disabled:opacity-50"
          style={{ background: "var(--brand)", color: "var(--card)" }}
        >
          <span className="text-[17px]">✦</span>
          {generating ? "Generando…" : "Generar menú automático"}
        </button>

        <div className="mt-3.5 flex gap-3.5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--gym-dot)" }} />
            Día de gimnasio
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ border: "1.5px solid var(--muted-light)" }}
            />
            Descanso
          </span>
        </div>

        <div className="mt-4">
          <SettingsPanel
            settings={settings}
            onSeasonChange={handleSeasonChange}
            onGymDaysChange={handleGymDaysChange}
          />
        </div>
      </header>

      {!menu ? (
        <p className="px-5 py-6 text-sm text-muted">Todavía no generaste el menú de esta semana.</p>
      ) : (
        <div className="notebook-bg flex flex-1 flex-col gap-2.5 py-3.5 pl-[22px] pr-3.5 pb-24">
          {menu.days.map((day, index) => {
            const isToday = day.date === todayISO;
            const almuerzoName = recipeById(day.almuerzoId)?.name;
            const cenaName = recipeById(day.cenaId)?.name;
            const hasAnyPlan = isPlannedSlot(day.weekday, "almuerzo") || isPlannedSlot(day.weekday, "cena") || almuerzoName || cenaName;
            const collapsedText = hasAnyPlan ? `${almuerzoName ?? "–"} · ${cenaName ?? "–"}` : "Sin planificar";

            return (
              <details
                key={day.date}
                className="details-chevron relative overflow-visible rounded-2xl border border-border-app"
                style={{ background: isToday ? "var(--today-bg)" : "var(--card)" }}
              >
                {isToday && (
                  <div
                    className="absolute left-[22px] top-[-9px] z-10 h-5 w-[62px] -rotate-3 rounded-sm shadow-sm"
                    style={{ background: "var(--washi)" }}
                  />
                )}
                <summary className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-3.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={
                      day.isGymDay
                        ? { background: "var(--gym-dot)" }
                        : { border: "1.5px solid var(--muted-light)" }
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-semibold text-foreground">
                        {WEEKDAY_LABELS[day.weekday]}
                      </span>
                      {isToday && (
                        <span
                          className="inline-block -rotate-2 font-hand text-[13px] font-bold"
                          style={{ color: "oklch(0.48 0.13 45)" }}
                        >
                          hoy
                        </span>
                      )}
                    </div>
                    <div className="collapsed-text mt-0.5 truncate text-[13px] text-muted">
                      {collapsedText}
                    </div>
                  </div>
                  <span className="chevron shrink-0 text-[13px] text-muted-light">⌄</span>
                </summary>

                <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
                  {(["almuerzo", "cena"] as const).map((slot) => {
                    const recipeId = slot === "almuerzo" ? day.almuerzoId : day.cenaId;
                    const planned = isPlannedSlot(day.weekday, slot);
                    const tag = tagFor(day, slot);
                    const tagStyle = tag ? TAG_STYLE[tag] : null;
                    const isRegeneratingThis = regenerating?.index === index && regenerating.slot === slot;

                    return (
                      <div key={slot} className="rounded-xl p-3.5" style={{ background: "var(--card-muted)" }}>
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: "var(--foreground-brand)" }}
                          >
                            {slot}
                          </span>
                          {planned && (
                            <button
                              onClick={() => handleRegenerateMeal(index, slot)}
                              disabled={regenerating !== null}
                              className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-bold disabled:opacity-50"
                              style={{ color: "var(--brand)" }}
                            >
                              <span className="text-sm">↻</span>
                              {isRegeneratingThis ? "Cambiando…" : "Recambiar"}
                            </button>
                          )}
                        </div>

                        <select
                          value={recipeId ?? ""}
                          onChange={(e) => handleManualSelect(index, slot, e.target.value)}
                          className="w-full rounded-[10px] border px-3 py-2.5 text-sm font-semibold"
                          style={{
                            borderColor: "var(--border-input)",
                            background: "var(--card)",
                            color: "var(--foreground)",
                          }}
                        >
                          <option value="">–</option>
                          {recipes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>

                        {tag && tagStyle && (
                          <span
                            className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{ background: tagStyle.bg, color: tagStyle.text }}
                          >
                            {tag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center text-sm text-muted">Cargando…</main>}>
      <HomeContent />
    </Suspense>
  );
}
