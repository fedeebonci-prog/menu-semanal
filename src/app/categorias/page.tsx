"use client";

import { useEffect, useState } from "react";
import { Recipe } from "@/lib/types";
import { getRecipes } from "@/lib/store";
import RecipesByCategory from "@/components/RecipesByCategory";

export default function CategoriasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipes().then((r) => {
      setRecipes(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <main className="mx-auto max-w-2xl p-4 sm:p-6">Cargando...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-brand-dark">Categorías</h1>
        <p className="text-sm text-neutral-500">{recipes.length} recetas cargadas</p>
      </header>

      <RecipesByCategory recipes={recipes} />
    </main>
  );
}
