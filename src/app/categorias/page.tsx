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
    return <main className="flex flex-1 items-center justify-center text-sm text-muted">Cargando…</main>;
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-border-app px-5 pb-[18px] pt-7">
        <h1 className="font-serif text-[26px] font-semibold tracking-tight text-foreground-brand">
          Categorías
        </h1>
        <p className="mt-1 text-sm text-muted">Recetas organizadas por tipo</p>
      </header>

      <div className="flex-1 px-3.5 pb-24 pt-3.5">
        <RecipesByCategory recipes={recipes} />
      </div>
    </main>
  );
}
