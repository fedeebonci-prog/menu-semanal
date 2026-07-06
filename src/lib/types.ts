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

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  proteinType: ProteinType;
  mealType: MealType;
  season: Season;
  highProtein: boolean;
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
