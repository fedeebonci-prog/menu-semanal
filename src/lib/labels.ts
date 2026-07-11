import { Difficulty, MealType, ProteinType, RecipeCategory, Season } from "./types";

export const CATEGORY_OPTIONS: { value: RecipeCategory; label: string }[] = [
  { value: "principal", label: "Principal" },
  { value: "pasta", label: "Pasta" },
  { value: "tarta", label: "Tarta" },
  { value: "pizza", label: "Pizza" },
  { value: "sandwich", label: "Sándwich / Hamburguesa" },
  { value: "entrada", label: "Entrada" },
  { value: "acompanamiento", label: "Acompañamiento" },
  { value: "sopa", label: "Sopa" },
  { value: "guiso", label: "Guiso / Estofado" },
  { value: "ensalada", label: "Ensalada" },
  { value: "postre", label: "Postre" },
];

export const PROTEIN_OPTIONS: { value: ProteinType; label: string }[] = [
  { value: "pollo", label: "Pollo" },
  { value: "carne", label: "Carne" },
  { value: "cerdo", label: "Cerdo" },
  { value: "pescado", label: "Pescado" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "huevo", label: "Huevo" },
  { value: "legumbre", label: "Legumbre" },
  { value: "pasta", label: "Pasta" },
  { value: "otro", label: "Otro" },
];

export const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "ambos", label: "Almuerzo o cena" },
  { value: "almuerzo", label: "Solo almuerzo" },
  { value: "cena", label: "Solo cena" },
];

export const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "todo_el_anio", label: "Todo el año" },
  { value: "verano", label: "Verano" },
  { value: "invierno", label: "Invierno" },
];

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "rapida", label: "Rápida" },
  { value: "media", label: "Media" },
  { value: "elaborada", label: "Elaborada" },
];

function toLabelMap<T extends string>(options: { value: T; label: string }[]): Record<T, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label])) as Record<T, string>;
}

export const CATEGORY_LABELS = toLabelMap(CATEGORY_OPTIONS);
export const PROTEIN_LABELS = toLabelMap(PROTEIN_OPTIONS);
export const MEAL_LABELS = toLabelMap(MEAL_OPTIONS);
export const SEASON_LABELS = toLabelMap(SEASON_OPTIONS);
export const DIFFICULTY_LABELS = toLabelMap(DIFFICULTY_OPTIONS);
