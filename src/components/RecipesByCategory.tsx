"use client";

import { Recipe } from "@/lib/types";
import { CATEGORY_OPTIONS, DIFFICULTY_LABELS, PROTEIN_LABELS, SEASON_LABELS } from "@/lib/labels";

interface Props {
  recipes: Recipe[];
}

export default function RecipesByCategory({ recipes }: Props) {
  return (
    <div className="space-y-2">
      {CATEGORY_OPTIONS.map(({ value, label }) => {
        const recipesInCategory = recipes.filter((r) => r.category === value);
        return (
          <details
            key={value}
            className="rounded-lg border border-brand-light bg-white open:pb-2"
          >
            <summary className="cursor-pointer select-none px-4 py-3 font-medium text-brand-dark">
              {label} <span className="text-neutral-400">({recipesInCategory.length})</span>
            </summary>
            {recipesInCategory.length === 0 ? (
              <p className="px-4 pb-2 text-sm text-neutral-400">
                Todavía no hay recetas en esta categoría.
              </p>
            ) : (
              <ul className="divide-y divide-brand-light px-4">
                {recipesInCategory.map((recipe) => (
                  <li key={recipe.id} className="py-2">
                    <details>
                      <summary className="cursor-pointer select-none text-sm text-brand-dark">
                        {recipe.name}
                      </summary>
                      <div className="mt-2 space-y-2 pb-1">
                        <div className="flex flex-wrap gap-1 text-xs text-neutral-500">
                          <span className="rounded-full bg-brand-light px-2 py-0.5">
                            {PROTEIN_LABELS[recipe.proteinType]}
                          </span>
                          <span className="rounded-full bg-brand-light px-2 py-0.5">
                            {SEASON_LABELS[recipe.season]}
                          </span>
                          <span className="rounded-full bg-brand-light px-2 py-0.5">
                            {DIFFICULTY_LABELS[recipe.difficulty]}
                          </span>
                          {recipe.highProtein && (
                            <span className="rounded-full bg-brand-light px-2 py-0.5">
                              Alta proteína
                            </span>
                          )}
                          {recipe.highCarb && (
                            <span className="rounded-full bg-brand-light px-2 py-0.5">
                              Alta en hidratos
                            </span>
                          )}
                          {recipe.light && (
                            <span className="rounded-full bg-brand-light px-2 py-0.5">
                              Liviana
                            </span>
                          )}
                        </div>
                        <ul className="text-sm text-neutral-600">
                          {recipe.ingredients.map((ing, idx) => (
                            <li key={idx}>
                              {ing.name}
                              {ing.quantity ? ` — ${ing.quantity}` : ""}
                            </li>
                          ))}
                        </ul>
                        {recipe.notes && (
                          <p className="text-sm italic text-neutral-500">{recipe.notes}</p>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </details>
        );
      })}
    </div>
  );
}
