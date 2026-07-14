"use client";

import { Recipe } from "@/lib/types";
import { CATEGORY_OPTIONS, DIFFICULTY_LABELS, PROTEIN_LABELS, SEASON_LABELS } from "@/lib/labels";

interface Props {
  recipes: Recipe[];
}

const NEUTRAL_CHIP = { background: "oklch(0.9 0.02 85)", color: "oklch(0.4 0.02 90)" };
const TAG_CHIPS: { key: "highCarb" | "light" | "highProtein"; label: string; bg: string; text: string }[] = [
  { key: "highCarb", label: "Alta en hidratos", bg: "var(--tag-carb-bg)", text: "var(--tag-carb-text)" },
  { key: "highProtein", label: "Alta en proteína", bg: "var(--tag-protein-bg)", text: "var(--tag-protein-text)" },
  { key: "light", label: "Liviana", bg: "var(--tag-light-bg)", text: "var(--tag-light-text)" },
];

export default function RecipesByCategory({ recipes }: Props) {
  const groups = CATEGORY_OPTIONS.map(({ value, label }) => ({
    value,
    label,
    recipes: recipes.filter((r) => r.category === value),
  })).filter((g) => g.recipes.length > 0);

  if (groups.length === 0) {
    return <p className="px-1 text-sm text-muted">Todavía no hay recetas cargadas.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {groups.map(({ value, label, recipes: recipesInCategory }) => (
        <details
          key={value}
          className="details-chevron overflow-hidden rounded-2xl border border-border-app bg-card"
        >
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5">
            <span className="font-serif text-base font-semibold text-foreground">
              {label} <span className="font-sans text-sm font-semibold text-muted-light">({recipesInCategory.length})</span>
            </span>
            <span className="chevron text-[13px] text-muted-light">⌄</span>
          </summary>

          <div className="flex flex-col gap-1.5 px-2.5 pb-2.5">
            {recipesInCategory.map((recipe) => (
              <details
                key={recipe.id}
                className="details-chevron overflow-hidden rounded-xl"
                style={{ background: "var(--card-muted)" }}
              >
                <summary className="flex cursor-pointer items-center justify-between px-3 py-2.5">
                  <span className="text-sm font-semibold text-foreground">{recipe.name}</span>
                  <span className="chevron text-xs text-muted-light">⌄</span>
                </summary>
                <div className="flex flex-col gap-2 px-3 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={NEUTRAL_CHIP}>
                      {PROTEIN_LABELS[recipe.proteinType]}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={NEUTRAL_CHIP}>
                      {DIFFICULTY_LABELS[recipe.difficulty]}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={NEUTRAL_CHIP}>
                      {SEASON_LABELS[recipe.season]}
                    </span>
                    {TAG_CHIPS.filter((t) => recipe[t.key]).map((t) => (
                      <span
                        key={t.key}
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: t.bg, color: t.text }}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
                      Ingredientes
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex justify-between gap-2.5 text-[13.5px]">
                          <span className="min-w-0 flex-1 truncate text-foreground">{ing.name}</span>
                          <span className="shrink-0 text-muted-light">{ing.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {recipe.notes && <p className="text-[13px] italic text-muted">{recipe.notes}</p>}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
