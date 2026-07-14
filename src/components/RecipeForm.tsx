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

const fieldLabelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted";
const inputClass =
  "w-full rounded-xl border p-3 text-[14.5px]";
const inputStyle = { borderColor: "var(--border-input)", background: "var(--card)", color: "var(--foreground)" };

interface Props {
  onSave: (recipe: Recipe) => Promise<void> | void;
  editingRecipe?: Recipe | null;
}

export default function RecipeForm({ onSave, editingRecipe }: Props) {
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
      setIngredients((prev) => [...prev.filter((i) => i.name), ...parsed]);
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
  }

  const tags: { key: "highCarb" | "light" | "highProtein"; label: string; active: boolean; toggle: () => void }[] = [
    { key: "highCarb", label: "Alta en hidratos", active: highCarb, toggle: () => setHighCarb((v) => !v) },
    { key: "light", label: "Liviana", active: light, toggle: () => setLight((v) => !v) },
    { key: "highProtein", label: "Alta en proteína", active: highProtein, toggle: () => setHighProtein((v) => !v) },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className="rounded-[14px] border border-dashed p-3.5"
        style={{ background: "oklch(0.955 0.02 60)", borderColor: "oklch(0.7 0.05 50)" }}
      >
        <label className="mb-1.5 block text-[13px] font-bold" style={{ color: "oklch(0.42 0.09 45)" }}>
          Pegar publicación de Instagram
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Pegá acá el texto de la publicación para extraer los ingredientes…"
          rows={3}
          className="w-full rounded-[10px] border p-2.5 text-[13.5px]"
          style={{ borderColor: "oklch(0.85 0.05 60)", background: "var(--card)" }}
        />
        <button
          type="button"
          onClick={handleExtract}
          disabled={!caption.trim()}
          className="mt-2 rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold disabled:opacity-40"
          style={{ background: "oklch(0.58 0.1 50)", color: "oklch(0.99 0.01 85)" }}
        >
          Extraer ingredientes
        </button>
      </div>

      <div>
        <label className={fieldLabelClass}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          style={inputStyle}
          placeholder="Ej: Pollo al horno con papas"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={fieldLabelClass}>Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RecipeCategory)}
            className={inputClass}
            style={inputStyle}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabelClass}>Proteína principal</label>
          <select
            value={proteinType}
            onChange={(e) => setProteinType(e.target.value as ProteinType)}
            className={inputClass}
            style={inputStyle}
          >
            {PROTEIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabelClass}>Dificultad</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className={inputClass}
            style={inputStyle}
          >
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabelClass}>Comida</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className={inputClass}
            style={inputStyle}
          >
            {MEAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabelClass}>Época del año</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as Season)}
            className={inputClass}
            style={inputStyle}
          >
            {SEASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={fieldLabelClass}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={tag.toggle}
              className="rounded-full border px-3 py-1.5 text-[12.5px] font-bold"
              style={
                tag.active
                  ? { background: "var(--brand)", borderColor: "var(--brand)", color: "var(--card)" }
                  : { background: "var(--card)", borderColor: "var(--border-input)", color: "var(--foreground)" }
              }
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={fieldLabelClass + " mb-0"}>Ingredientes</label>
          <button
            type="button"
            onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
            className="text-[12.5px] font-bold"
            style={{ color: "var(--brand)" }}
          >
            + Agregar
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                placeholder="Ingrediente"
                className="flex-[2] rounded-[10px] border p-2.5 text-[13.5px]"
                style={inputStyle}
              />
              <input
                value={ing.quantity}
                onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                placeholder="Cantidad"
                className="flex-1 rounded-[10px] border p-2.5 text-[13.5px]"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="w-9 shrink-0 rounded-[10px] text-[15px]"
                style={{ background: "var(--card-muted)", color: "oklch(0.5 0.09 30)" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={fieldLabelClass}>Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Trucos, tiempos de cocción, variantes…"
          rows={3}
          className="w-full rounded-[10px] border p-2.5 text-[13.5px]"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-[14px] py-3.5 text-[15px] font-bold disabled:opacity-50"
        style={{ background: "var(--brand)", color: "var(--card)" }}
      >
        {editingRecipe ? "Guardar cambios" : "Guardar receta"}
      </button>
    </form>
  );
}
