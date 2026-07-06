"use client";

import { Recipe } from "@/lib/types";

const PROTEIN_LABELS: Record<Recipe["proteinType"], string> = {
  pollo: "Pollo",
  carne: "Carne",
  cerdo: "Cerdo",
  pescado: "Pescado",
  vegetariano: "Vegetariano",
  huevo: "Huevo",
  legumbre: "Legumbre",
  pasta: "Pasta",
  otro: "Otro",
};

const SEASON_LABELS: Record<Recipe["season"], string> = {
  verano: "Verano",
  invierno: "Invierno",
  todo_el_anio: "Todo el año",
};

interface Props {
  recipes: Recipe[];
  onDelete: (id: string) => void;
  onEdit: (recipe: Recipe) => void;
}

export default function RecipeList({ recipes, onDelete, onEdit }: Props) {
  if (recipes.length === 0) {
    return <p className="text-sm text-neutral-500">Todavía no hay recetas cargadas.</p>;
  }

  return (
    <ul className="divide-y divide-brand-light rounded-lg border border-brand-light bg-white">
      {recipes.map((recipe) => (
        <li key={recipe.id} className="flex items-start justify-between gap-3 p-3">
          <div>
            <p className="font-medium text-brand-dark">{recipe.name}</p>
            <div className="mt-1 flex flex-wrap gap-1 text-xs text-neutral-500">
              <span className="rounded-full bg-brand-light px-2 py-0.5">
                {PROTEIN_LABELS[recipe.proteinType]}
              </span>
              <span className="rounded-full bg-brand-light px-2 py-0.5">
                {SEASON_LABELS[recipe.season]}
              </span>
              {recipe.highProtein && (
                <span className="rounded-full bg-brand-light px-2 py-0.5">Alta proteína</span>
              )}
              {recipe.source === "instagram" && (
                <span className="rounded-full bg-brand-light px-2 py-0.5">Instagram</span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {recipe.ingredients.map((i) => i.name).join(", ")}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              onClick={() => onEdit(recipe)}
              className="text-xs text-brand-dark underline"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="text-xs text-neutral-400 hover:text-red-500"
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
