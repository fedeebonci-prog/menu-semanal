"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { generateWeeklyMenu, recentRecipeIdsFromMenus } from "@/lib/menuGenerator";
import { buildShoppingList } from "@/lib/shoppingList";
import { currentWeekId, WEEKDAY_LABELS } from "@/lib/dateUtils";
import SettingsPanel from "@/components/SettingsPanel";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const weekId = currentWeekId();

  useEffect(() => {
    (async () => {
      const [r, s, m] = await Promise.all([getRecipes(), getSettings(), getMenu(weekId)]);
      setRecipes(r);
      setSettings(s);
      setMenu(m);
      setLoading(false);
    })();
  }, [weekId]);

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-brand-dark">Semana del {weekId}</h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {generating ? "Generando..." : menu ? "Regenerar semana" : "Generar semana"}
          </button>
        </div>

        {!menu && (
          <p className="text-sm text-neutral-500">
            Todavía no generaste el menú de esta semana.
          </p>
        )}

        {menu && (
          <ul className="divide-y divide-brand-light rounded-lg border border-brand-light bg-white">
            {menu.days.map((day) => (
              <li key={day.date} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-brand-dark">
                    {WEEKDAY_LABELS[day.weekday]}
                  </span>
                  {day.isGymDay && (
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs text-brand-dark">
                      Gimnasio
                    </span>
                  )}
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
        <Link href="/compras" className="text-brand-dark underline">
          Lista de compras
        </Link>
      </nav>
    </main>
  );
}
