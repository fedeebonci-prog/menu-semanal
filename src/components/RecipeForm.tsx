"use client";

import { useState } from "react";
import { Difficulty, Ingredient, MealType, ProteinType, Recipe, RecipeCategory, Season } from "@/lib/types";
import { newId } from "@/lib/store";
import { parseIngredientsFromCaption } from "@/lib/instagramParser";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  MEAL_OPTIONS,
  PROTEIN_OPTIONS,
  SEASON_OPTIONS,
} from "@/lib/labels";

const emptyIngredient = (): Ingredient => ({ name: "", quantity: "" });

interface Props {
  onSave: (recipe: Recipe) => Promise<void> | void;
  editingRecipe?: Recipe | null;
  onCancelEdit?: () => void;
}

export default function RecipeForm({ onSave, editingRecipe, onCancelEdit }: Props) {
  const [name, setName] = useState(editingRecipe?.name ?? "");
  const [category, setCategory] = useState<RecipeCategory>(editingRecipe?.category ?? "principal_pollo");
  const [proteinType, setProteinType] = useState<ProteinType>(editingRecipe?.proteinType ?? "pollo");
  const [mealType, setMealType] = useState<MealType>(editingRecipe?.mealType ?? "ambos");
  const [season, setSeason] = useState<Season>(editingRecipe?.season ?? "todo_el_anio");
  const [difficulty, setDifficulty] = useState<Difficulty>(editingRecipe?.difficulty ?? "media");
  const [highProtein, setHighProtein] = useState(editingRecipe?.highProtein ?? false);
  const [highCarb, setHighCarb] = useState(editingRecipe?.highCarb ?? false);
  const [light, setLight] = useState(editingRecipe?.light ?? false);
  const [notes, setNotes] = useState(editingRecipe?.notes ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editingRecipe && editingRecipe.ingredients.length > 0
      ? editingRecipe.ingredients
      : [emptyIngredient()]
  );
  const [caption, setCaption] = useState("");
  const [fromInstagram, setFromInstagram] = useState(editingRecipe?.source === "instagram");
  const [saving, setSaving] = useState(false);

  function handleExtract() {
    const parsed = parseIngredientsFromCaption(caption);
    if (parsed.length > 0) {
      setIngredients(parsed);
      setFromInstagram(true);
    }
  }

  function updateIngredient(idx: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function reset() {
    setName("");
    setCategory("principal_pollo");
    setProteinType("pollo");
    setMealType("ambos");
    setSeason("todo_el_anio");
    setDifficulty("media");
    setHighProtein(false);
    setHighCarb(false);
    setLight(false);
    setNotes("");
    setIngredients([emptyIngredient()]);
    setCaption("");
    setFromInstagram(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
      .filter((i) => i.name.length > 0);
    if (!name.trim() || cleanIngredients.length === 0) return;

    setSaving(true);
    const recipe: Recipe = {
      id: editingRecipe?.id ?? newId(),
      name: name.trim(),
      category,
      proteinType,
      mealType,
      season,
      difficulty,
      highProtein,
      highCarb,
      light,
      ingredients: cleanIngredients,
      notes: notes.trim(),
      source: fromInstagram ? "instagram" : "manual",
      createdAt: editingRecipe?.createdAt ?? new Date().toISOString(),
    };
    await onSave(recipe);
    setSaving(false);
    reset();
    if (editingRecipe) onCancelEdit?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-brand-light bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">
          Pegar receta de Instagram (opcional)
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Pegá acá el texto de la publicación con los ingredientes..."
          rows={3}
          className="w-full rounded-md border border-neutral-200 p-2 text-sm"
        />
        <button
          type="button"
          onClick={handleExtract}
          disabled={!caption.trim()}
          className="mt-2 rounded-md border border-brand px-3 py-1 text-sm text-brand-dark disabled:opacity-40"
        >
          Extraer ingredientes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-200 p-2 text-sm"
            placeholder="Ej: Pollo al horno con papas"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RecipeCategory)}
            className="w-full rounded-md border border-neutral-200 p-2 text-sm"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Proteína principal</label>
          <select
            value={proteinType}
            onChange={(e) => setProteinType(e.target.value as ProteinType)}
            className="w-full rounded-md border border-neutral-200 p-2 text-sm"
          >
            {PROTEIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Dificultad</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-md border border-neutral-200 p-2 text-sm"
          >
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Comida</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-md border border-neutral-200 p-2 text-sm"
          >
            {MEAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Época del año</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as Season)}
            className="w-full rounded-md border border-neutral-200 p-2 text-sm"
          >
            {SEASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-brand-dark">
          <input
            type="checkbox"
            checked={highProtein}
            onChange={(e) => setHighProtein(e.target.checked)}
          />
          Rica en proteína (priorizar en cenas de días de gimnasio)
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-dark">
          <input
            type="checkbox"
            checked={highCarb}
            onChange={(e) => setHighCarb(e.target.checked)}
          />
          Alta en hidratos (priorizar en almuerzos de días de gimnasio)
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-dark">
          <input
            type="checkbox"
            checked={light}
            onChange={(e) => setLight(e.target.checked)}
          />
          Liviana (priorizar en días de descanso)
        </label>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-brand-dark">Ingredientes</label>
          <button
            type="button"
            onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
            className="text-sm text-brand-dark underline"
          >
            + agregar
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                placeholder="Ingrediente"
                className="flex-1 rounded-md border border-neutral-200 p-2 text-sm"
              />
              <input
                value={ing.quantity}
                onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                placeholder="Cantidad"
                className="w-28 rounded-md border border-neutral-200 p-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="px-2 text-sm text-neutral-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">Notas (opcional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-neutral-200 p-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {editingRecipe ? "Guardar cambios" : "Guardar receta"}
        </button>
        {editingRecipe && (
          <button
            type="button"
            onClick={() => {
              reset();
              onCancelEdit?.();
            }}
            className="text-sm text-neutral-500 underline"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}
