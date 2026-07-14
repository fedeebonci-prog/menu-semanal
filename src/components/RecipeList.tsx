"use client";

import { Recipe } from "@/lib/types";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, PROTEIN_LABELS } from "@/lib/labels";

interface Props {
  recipes: Recipe[];
  onDelete: (id: string) => void;
  onEdit: (recipe: Recipe) => void;
}

export default function RecipeList({ recipes, onDelete, onEdit }: Props) {
  if (recipes.length === 0) {
    return <p className="text-sm text-muted">Todavía no hay recetas cargadas.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {recipes.map((recipe) => (
        <li
          key={recipe.id}
          className="flex items-center gap-2.5 rounded-[14px] border border-border-app bg-card p-3.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[15px] font-semibold text-foreground">
              {recipe.name}
            </p>
            <p className="mt-0.5 truncate text-[12.5px] text-muted">
              {CATEGORY_LABELS[recipe.category]} · {PROTEIN_LABELS[recipe.proteinType]} ·{" "}
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </p>
          </div>
          <button
            onClick={() => onEdit(recipe)}
            className="shrink-0 rounded-[9px] px-2.5 py-1.5 text-xs font-bold"
            style={{ background: "var(--card-muted)", color: "var(--foreground-brand)" }}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(recipe.id)}
            className="shrink-0 rounded-[9px] px-2.5 py-1.5 text-xs font-bold"
            style={{ background: "var(--card-muted)", color: "oklch(0.5 0.09 30)" }}
          >
            Borrar
          </button>
        </li>
      ))}
    </ul>
  );
}
