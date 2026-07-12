"use client";

import { useEffect, useRef, useState } from "react";
import { Recipe } from "@/lib/types";
import { deleteRecipe, getRecipes, saveRecipe } from "@/lib/store";
import RecipeForm from "@/components/RecipeForm";
import RecipeList from "@/components/RecipeList";

export default function RecetasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleEdit(recipe: Recipe) {
    setEditingRecipe(recipe);
    formRef.current?.scrollIntoView({ block: "start" });
  }

  useEffect(() => {
    getRecipes().then((r) => {
      setRecipes(r);
      setLoading(false);
    });
  }, []);

  async function handleSave(recipe: Recipe) {
    await saveRecipe(recipe);
    setRecipes(await getRecipes());
    setEditingRecipe(null);
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    setRecipes(await getRecipes());
    if (editingRecipe?.id === id) setEditingRecipe(null);
  }

  if (loading) {
    return <main className="mx-auto max-w-2xl p-4 sm:p-6">Cargando...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-dark">Recetas</h1>
        <p className="text-sm text-neutral-500">{recipes.length} recetas cargadas</p>
      </header>

      <div ref={formRef}>
        <RecipeForm
          key={editingRecipe?.id ?? "new"}
          onSave={handleSave}
          editingRecipe={editingRecipe}
          onCancelEdit={() => setEditingRecipe(null)}
        />
      </div>
      <RecipeList recipes={recipes} onDelete={handleDelete} onEdit={handleEdit} />
    </main>
  );
}
