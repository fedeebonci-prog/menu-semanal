"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
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
import { generateWeeklyMenu, recentRecipeIdsFromMenus, regenerateDay } from "@/lib/menuGenerator";
import { buildShoppingList } from "@/lib/shoppingList";
import { addDays, defaultWeekStart, formatWeekRange, WEEKDAY_LABELS } from "@/lib/dateUtils";
import SettingsPanel from "@/components/SettingsPanel";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekId = searchParams.get("week") ?? defaultWeekStart();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [loadedWeekId, setLoadedWeekId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const loading = loadedWeekId !== weekId;

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

  async function handleRegenerateDay(dayIndex: number) {
    if (!menu || !settings) return;
    setRegeneratingDay(dayIndex);
    const allMenus = await getMenus();
    const recentIds = recentRecipeIdsFromMenus(allMenus, weekId, 2);
    const updated = regenerateDay(menu, dayIndex, recipes, settings, recentIds);
    await saveMenu(updated);

    const previousList = await getShoppingList(weekId);
    const list = buildShoppingList(updated, recipes, previousList);
    await saveShoppingList(list);

    setMenu(updated);
    setRegeneratingDay(null);
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
    return <main className="mx-auto max-w-2xl p-4 sm:p-6">Cargando...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-dark">Menú de la semana</h1>
        <p className="text-sm text-neutral-500">{recipes.length} recetas cargadas</p>
      </header>

      <SettingsPanel
        settings={settings}
        onSeasonChange={handleSeasonChange}
        onGymDaysChange={handleGymDaysChange}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => goToWeek(addDays(weekId, -7))}
            className="rounded-full border border-brand-light px-2 py-1 text-sm text-brand-dark"
            aria-label="Semana anterior"
          >
            ←
          </button>
          <h2 className="text-center text-lg font-medium text-brand-dark">
            Semana del {formatWeekRange(weekId)}
          </h2>
          <button
            onClick={() => goToWeek(addDays(weekId, 7))}
            className="rounded-full border border-brand-light px-2 py-1 text-sm text-brand-dark"
            aria-label="Semana siguiente"
          >
            →
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {generating ? "Generando..." : menu ? "Regenerar semana" : "Generar semana"}
        </button>

        {!menu && (
          <p className="text-sm text-neutral-500">
            Todavía no generaste el menú de esta semana.
          </p>
        )}

        {menu && (
          <ul className="divide-y divide-brand-light rounded-lg border border-brand-light bg-white">
            {menu.days.map((day, index) => (
              <li key={day.date} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-brand-dark">
                      {WEEKDAY_LABELS[day.weekday]}
                    </span>
                    {day.isGymDay && (
                      <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs text-brand-dark">
                        Gimnasio
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRegenerateDay(index)}
                    disabled={regeneratingDay !== null}
                    className="text-xs text-brand-dark underline disabled:opacity-50"
                  >
                    {regeneratingDay === index ? "Cambiando..." : "Recambiar"}
                  </button>
                </div>
                <p className="text-sm text-neutral-600">
                  Almuerzo: {recipeById(day.almuerzoId)?.name ?? "-"}
                </p>
                <p className="text-sm text-neutral-600">
                  Cena: {recipeById(day.cenaId)?.name ?? "-"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="flex gap-4 text-sm">
        <Link href="/recetas" className="text-brand-dark underline">
          Ver recetas
        </Link>
        <Link href={`/compras?week=${weekId}`} className="text-brand-dark underline">
          Lista de compras
        </Link>
      </nav>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl p-4 sm:p-6">Cargando...</main>}>
      <HomeContent />
    </Suspense>
  );
}
