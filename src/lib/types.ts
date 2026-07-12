export type ProteinType =
  | "pollo"
  | "carne"
  | "cerdo"
  | "pescado"
  | "vegetariano"
  | "huevo"
  | "legumbre"
  | "pasta"
  | "otro";

export type Season = "verano" | "invierno" | "todo_el_anio";

export type MealType = "almuerzo" | "cena" | "ambos";

export type RecipeCategory =
  | "principal_vaca"
  | "principal_cerdo"
  | "principal_pollo"
  | "principal_pescado"
  | "principal_veggie"
  | "pasta"
  | "tarta"
  | "pizza"
  | "sandwich"
  | "entrada"
  | "acompanamiento"
  | "sopa"
  | "guiso"
  | "ensalada"
  | "postre";

export type Difficulty = "rapida" | "media" | "elaborada";

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  proteinType: ProteinType;
  mealType: MealType;
  season: Season;
  difficulty: Difficulty;
  highProtein: boolean;
  highCarb: boolean;
  light: boolean;
  ingredients: Ingredient[];
  notes: string;
  source: "manual" | "instagram";
  createdAt: string;
}

export interface Settings {
  gymDays: number[];
  season: Season;
}

export interface DayPlan {
  date: string;
  weekday: number;
  isGymDay: boolean;
  almuerzoId: string | null;
  cenaId: string | null;
}

export interface WeeklyMenu {
  id: string;
  weekStart: string;
  season: Season;
  days: DayPlan[];
  createdAt: string;
}

export interface ShoppingListItem {
  name: string;
  haveIt: boolean;
  fromRecipes: string[];
  quantities: string[];
}

export interface ShoppingList {
  weekId: string;
  items: ShoppingListItem[];
}
