"use client";

import { useEffect, useState } from "react";
import { Recipe } from "@/lib/types";
import { deleteRecipe, getRecipes, saveRecipe } from "@/lib/store";
import RecipeForm from "@/components/RecipeForm";
import RecipeList from "@/components/RecipeList";

type Mode = "list" | "form";

export default function RecetasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    getRecipes().then((r) => {
      setRecipes(r);
      setLoading(false);
    });
  }, []);

  function handleEdit(recipe: Recipe) {
    setEditingRecipe(recipe);
    setMode("form");
  }

  function handleNew() {
    setEditingRecipe(null);
    setMode("form");
  }

  function handleCancel() {
    setEditingRecipe(null);
    setMode("list");
  }

  async function handleSave(recipe: Recipe) {
    await saveRecipe(recipe);
    setRecipes(await getRecipes());
    setEditingRecipe(null);
    setMode("list");
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    setRecipes(await getRecipes());
    if (editingRecipe?.id === id) {
      setEditingRecipe(null);
      setMode("list");
    }
  }

  if (loading) {
    return <main className="flex flex-1 items-center justify-center text-sm text-muted">Cargando…</main>;
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-border-app px-5 pb-[18px] pt-7">
        {mode === "list" ? (
          <>
            <div className="flex items-center justify-between gap-2.5">
              <div>
                <h1 className="font-serif text-[26px] font-semibold tracking-tight text-foreground-brand">
                  Recetas
                </h1>
                <p className="mt-1 text-sm text-muted">{recipes.length} recetas guardadas</p>
              </div>
            </div>
            <button
              onClick={handleNew}
              className="mt-4 w-full rounded-[14px] py-3.5 text-[15px] font-bold"
              style={{ background: "var(--brand)", color: "var(--card)" }}
            >
              + Nueva receta
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2.5">
            <h1 className="font-serif text-[22px] font-semibold text-foreground-brand">
              {editingRecipe ? "Editar receta" : "Nueva receta"}
            </h1>
            <button onClick={handleCancel} className="px-2.5 py-1.5 text-sm font-bold text-muted">
              Cancelar
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 px-4 pb-24 pt-3.5">
        {mode === "list" ? (
          <RecipeList recipes={recipes} onDelete={handleDelete} onEdit={handleEdit} />
        ) : (
          <RecipeForm
            key={editingRecipe?.id ?? "new"}
            onSave={handleSave}
            editingRecipe={editingRecipe}
          />
        )}
      </div>
    </main>
  );
}
